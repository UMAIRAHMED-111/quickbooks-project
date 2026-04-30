"""
Airflow DAG with explicit ETL stages:
fetch_n8n_json -> extract_payload -> transform_payload -> validate_payload
-> load_warehouse -> post_load_checks
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
import tempfile

# ✅ FIX: Point to src folder (THIS is the key change)
PROJECT_SRC = Path("/opt/airflow/project/src")
if str(PROJECT_SRC) not in sys.path:
    sys.path.insert(0, str(PROJECT_SRC))

# ✅ Airflow imports
from airflow.decorators import dag, task

# ✅ Your project imports
from qbo_pipeline.config import Settings
from qbo_pipeline.db.pool import pooled_connection
from qbo_pipeline.etl.extract import extract, fetch_webhook_to_tempfile
from qbo_pipeline.etl.load import load
from qbo_pipeline.etl.transform import LoadBundle, transform
from qbo_pipeline.etl.validate import validate_bundle
from qbo_pipeline.observability import configure_logging, get_logger

configure_logging(service="qbo_pipeline_airflow")
logger = get_logger(__name__)

# Default DAG arguments
_DEFAULT_ARGS = {
    "owner": "qbo-pipeline",
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
    "execution_timeout": timedelta(minutes=30),
}


@dag(
    dag_id="qbo_n8n_sync",
    default_args=_DEFAULT_ARGS,
    description="n8n fetch/extract/transform/validate/load pipeline with post-load checks.",
    schedule=timedelta(days=1),
    start_date=datetime(2025, 1, 1),
    catchup=False,
    dagrun_timeout=timedelta(hours=1),
    tags=["qbo", "n8n", "supabase"],
)
def qbo_n8n_sync():

    @task(task_id="fetch_n8n_json")
    def fetch_n8n_json() -> str:
        settings = Settings.from_env()
        path = fetch_webhook_to_tempfile(settings)
        logger.info("airflow_fetch_completed", payload_path=path)
        return path

    @task(task_id="extract_payload")
    def extract_payload(payload_path: str) -> str:
        """Load payload from fetch stage and persist a normalized extract artifact."""
        settings = Settings.from_env()
        path = Path(payload_path)
        try:
            payload = extract(settings, local_path=path)
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                prefix="qbo_extract_",
                suffix=".json",
                delete=False,
            ) as tmp:
                extracted_path = str(Path(tmp.name))
                json.dump(payload, tmp)
            logger.info("airflow_extract_completed", payload_path=extracted_path)
            return extracted_path
        finally:
            path.unlink(missing_ok=True)

    @task(task_id="transform_payload")
    def transform_payload(extracted_path: str) -> str:
        """Transform extracted JSON into a serialized LoadBundle artifact."""
        path = Path(extracted_path)
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
            bundle = transform(payload)
            logger.info(
                "airflow_transform_completed",
                customer_count=len(bundle.customers),
                invoice_count=len(bundle.invoices),
                payment_count=len(bundle.payments),
                allocation_count=len(bundle.payment_invoice_allocations),
            )
            bundle_dict = {
                "customers": bundle.customers,
                "invoices": bundle.invoices,
                "payments": bundle.payments,
                "payment_invoice_allocations": bundle.payment_invoice_allocations,
            }
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                prefix="qbo_bundle_",
                suffix=".json",
                delete=False,
            ) as tmp:
                bundle_path = str(Path(tmp.name))
                json.dump(bundle_dict, tmp)
            return bundle_path
        finally:
            path.unlink(missing_ok=True)

    @task(task_id="validate_payload")
    def validate_payload(bundle_path: str) -> str:
        """Validate technical and business integrity before loading warehouse."""
        data = json.loads(Path(bundle_path).read_text(encoding="utf-8"))
        bundle = LoadBundle(**data)
        validate_bundle(bundle)
        logger.info(
            "airflow_validate_completed",
            customer_count=len(bundle.customers),
            invoice_count=len(bundle.invoices),
            payment_count=len(bundle.payments),
            allocation_count=len(bundle.payment_invoice_allocations),
        )
        return bundle_path

    @task(task_id="load_warehouse")
    def load_warehouse(bundle_path: str) -> str:
        """Upsert validated bundle and finalize sync run."""
        settings = Settings.from_env()
        path = Path(bundle_path)
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            bundle = LoadBundle(**data)
            sync_id = load(settings, bundle)
            logger.info("airflow_load_completed", sync_run_id=sync_id)
            return sync_id
        finally:
            path.unlink(missing_ok=True)

    @task(task_id="post_load_checks")
    def post_load_checks(sync_id: str) -> str:
        """
        Optional post-load quality checks:
        verify sync_run status and counts are present/non-negative.
        """
        settings = Settings.from_env()
        with pooled_connection(settings.supabase_database_url, autocommit=True) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        status,
                        customer_count,
                        invoice_count,
                        payment_count,
                        allocation_count
                    FROM public.sync_runs
                    WHERE id = %s
                    """,
                    (sync_id,),
                )
                row = cur.fetchone()
        if row is None:
            raise RuntimeError(f"post_load_checks: sync_run not found: {sync_id}")

        status, customer_count, invoice_count, payment_count, allocation_count = row
        if status != "success":
            raise RuntimeError(
                f"post_load_checks: sync_run {sync_id} not successful (status={status})"
            )
        counts = [customer_count, invoice_count, payment_count, allocation_count]
        if any(c is None or c < 0 for c in counts):
            raise RuntimeError(
                f"post_load_checks: invalid counts for sync_run {sync_id}: {counts}"
            )
        logger.info(
            "airflow_post_load_checks_completed",
            sync_run_id=sync_id,
            customer_count=customer_count,
            invoice_count=invoice_count,
            payment_count=payment_count,
            allocation_count=allocation_count,
        )
        return sync_id

    checked_sync_id = post_load_checks(
        load_warehouse(
            validate_payload(transform_payload(extract_payload(fetch_n8n_json())))
        )
    )
    # Keep the final artifact in the graph and make task dependencies explicit.
    checked_sync_id


# Required for Airflow to detect DAG
qbo_n8n_sync_dag = qbo_n8n_sync()
