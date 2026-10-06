export class LaravelApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = 'LaravelApiError';
  }
}

export function apiErrorMessage(error: unknown, fallback = 'No fue posible completar la operación') {
  if (error instanceof LaravelApiError) {
    const firstValidationError = Object.values(error.errors).flat()[0];
    return firstValidationError || error.message || fallback;
  }

  return error instanceof Error && error.message ? error.message : fallback;
}
