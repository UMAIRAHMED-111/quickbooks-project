import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiRequestError } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorCodes";

export function BlockError({ error }: { error: unknown }) {
  const is503 = error instanceof ApiRequestError && error.status === 503;
  return (
    <Alert variant={is503 ? "destructive" : "default"}>
      <AlertTriangle className="size-4" />
      <AlertTitle>Unable to load this block</AlertTitle>
      <AlertDescription>{getErrorMessage(error)}</AlertDescription>
    </Alert>
  );
}
