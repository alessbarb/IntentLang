// _prelude.ts
export type Brand<B extends string> = { readonly __brand: B };
export type Result<T, E> = { type: "Ok"; value: T } | { type: "Err"; error: E };

export interface Http {
  get(
    path: string,
  ): Promise<Result<unknown, { code: number; message: string }>>;
  post<T>(
    path: string,
    body: unknown,
  ): Promise<Result<T, { code: number; message: string }>>;
}
export interface Clock {
  now(): Date;
}
export interface Random {
  next(): number;
}
