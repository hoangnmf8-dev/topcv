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
export class ConflictError extends AppError {
  constructor(message: string, code: string) {
    super(message, code, 409);
  }
}
export class InvalidCredentialsError extends AppError {
  constructor(message: string, code: string) {
    super(message, code, 401);
  }
}
export class AccountBlockedError extends AppError {
  constructor(message: string, code: string) {
    super(message, code, 403);
  }
}
export class AccountNotFoundError extends AppError {
  constructor(message: string, code: string) {
    super(message, code, 404);
  }
}
export class Unauthorized extends AppError {
  constructor(message: string, code: string) {
    super(message, code, 401);
  }
};
export class BadRequest extends AppError {
  constructor(message: string, code: string) {
    super(message, code, 400);
  }
}
