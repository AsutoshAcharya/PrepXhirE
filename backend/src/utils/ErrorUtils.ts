import Some from "./Some";

class ErrorUtils {
  public static getErrorMessage(
    error: unknown,
    fallback = "An error occurred"
  ): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    if (typeof error === "object" && error !== null && "message" in error) {
      return Some.String((error as any).message);
    }
    return fallback;
  }
}

export default ErrorUtils;
