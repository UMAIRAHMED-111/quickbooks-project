"""
Airflow DAG: n8n payload → temp file → extract, transform, incremental load (single sync run).
"""

from __future__ import annotations

import sys
from datetime import datetime, timedelta
from pathlib import Path

# ✅ FIX: Point to src folder (THIS is the key change)
PROJECT_SRC = Path("/opt/airflow/project/src")
if str(PROJECT_SRC) not in sys.path:
    sys.path.insert(0, str(PROJECT_SRC))

# ✅ Airflow imports
from airflow.decorators import dag, task

# ✅ Your project imports
from qbo_pipeline.config import Settings
from qbo_pipeline.etl.extract import extract, fetch_webhook_to_tempfile
from qbo_pipeline.etl.load import load
from qbo_pipeline.observability import configure_logging, get_logger
from qbo_pipeline.etl.transform import transform

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
    description="n8n fetch → temp file → extract, transform, warehouse upsert (N8N_WEBHOOK_URL + Postgres).",
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

    @task(task_id="warehouse_sync")
    def warehouse_sync(payload_path: str) -> str:
        """Read temp JSON, transform, upsert; ``load`` creates ``sync_runs`` and finalizes in one flow."""
        settings = Settings.from_env()
        path = Path(payload_path)
        try:
            payload = extract(settings, local_path=path)
            bundle = transform(payload)
            logger.info(
                "airflow_transform_completed",
                customer_count=len(bundle.customers),
                invoice_count=len(bundle.invoices),
                payment_count=len(bundle.payments),
                allocation_count=len(bundle.payment_invoice_allocations),
            )
            sync_id = load(settings, bundle)
            logger.info("airflow_sync_completed", sync_run_id=sync_id)
            return sync_id
        finally:
            path.unlink(missing_ok=True)

    warehouse_sync(fetch_n8n_json())


# Required for Airflow to detect DAG
qbo_n8n_sync_dag = qbo_n8n_sync()
