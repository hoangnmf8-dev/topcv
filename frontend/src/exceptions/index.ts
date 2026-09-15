export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
export class Unauthorized extends AppError {
  constructor(message: string, code: string) {
    super(message, code, 401);
  }
};