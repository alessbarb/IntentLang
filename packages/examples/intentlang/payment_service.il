intent "Payment service" tags ["payments"]

uses {
  http: Http { baseUrl: "https://api.example.com", timeoutMs: 3000 },
}

types {
  type CardNumber = String brand "CardNumber" where matches("^\\d{16}$");
  type PaymentId = String;
  type Payment =
    | Card { id: PaymentId, card: CardNumber }
    | Cash { id: PaymentId, amount: Float where _ >= 0 };
  type PaymentError = { code: Int, message: String };
}

effect processPayment(p: Payment): Result<Bool, PaymentError> uses http {
  return http.post("/payments", p);
}
