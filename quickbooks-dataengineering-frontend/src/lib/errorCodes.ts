import { ApiRequestError } from "@/lib/api"

export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: "The request was invalid. Please check your input and try again.",
  401: "Authentication failed. Check your sync token if the server requires one.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This record conflicts with an existing one.",
  422: "The submitted data is invalid.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "An unexpected server error occurred. Please try again later.",
  502: "The AI service is temporarily unavailable (e.g. quota). Try again later.",
  503: "The service is unavailable. The database or Q&A may not be configured on the server.",
}

export const NETWORK_ERROR_MESSAGE =
  "Network error. Please check your connection and API base URL."

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}

function messageFromBody(body: unknown): string | undefined {
  if (!isRecord(body)) return undefined
  if (typeof body.error === "string" && body.error.length > 0) {
    const detail =
      typeof body.detail === "string" ? `: ${body.detail}` : ""
    return `${body.error}${detail}`
  }
  if (typeof body.detail === "string") return body.detail
  if (typeof body.message === "string") return body.message
  return undefined
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiRequestError) {
    const fromBody = messageFromBody(err.body)
    if (fromBody) return fromBody
    return (
      HTTP_ERROR_MESSAGES[err.status] ??
      err.message ??
      "Something went wrong."
    )
  }
  if (err instanceof TypeError && err.message.includes("fetch")) {
    return NETWORK_ERROR_MESSAGE
  }
  if (err instanceof Error) return err.message
  return "Something went wrong."
}
