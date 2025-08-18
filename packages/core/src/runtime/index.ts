export type Brand<B extends string> = { readonly __brand: B };
export type Result<T, E> = { type: "Ok"; value: T } | { type: "Err"; error: E };
