export type Email = string & Brand<"Email">;
export type UserId = string;
export interface User {
  id: UserId;
  name: string;
  email: Email;
  createdAt: Date;
}
export interface ApiError {
  code: number;
  message: string;
}

export function toEmail(s: string): Result<Email, string> {
  // v0.2: implement
}

export async function createUser(
  deps: { http: Http; clock: Clock },
  input: { name: string; email: Email },
): Promise<Result<User, ApiError>> {
  // v0.2: implement
}
