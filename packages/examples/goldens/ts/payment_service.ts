export type CardNumber = string & Brand<"CardNumber">;
export type PaymentId = string;
export type Payment =
  | { type: "Card"; id: PaymentId; card: CardNumber }
  | { type: "Cash"; id: PaymentId; amount: number };
export interface PaymentError {
  code: number;
  message: string;
}

export async function processPayment(
  deps: { http: Http },
  p: Payment,
): Promise<Result<boolean, PaymentError>> {
  return deps.http.post<boolean>("/payments", p);
}
