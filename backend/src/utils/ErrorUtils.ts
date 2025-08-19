import Some from "./Some";

class ErrorUtils {
  public static getErrorMessage(
    error: unknown,
    fallback = "Something went wrong!"
  ): string {
    console.log("Error:", error);
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    if (typeof error === "object" && error !== null && "message" in error) {
      return Some.String((error as any).message);
    }
    return fallback;
  }
}

export default ErrorUtils;
