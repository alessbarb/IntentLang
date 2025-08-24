intent "Invoice service"

uses {
  http: Http { baseUrl: "https://api.example.com", timeoutMs: 3000 },
  clock: Clock {},
}

types {
  type InvoiceId = String;
  type Invoice = {
    id: InvoiceId,
    orderId: String,
    issuedAt: DateTime,
  };
  type InvoiceError = { code: Int, message: String };
}

effect generateInvoice(orderId: String): Result<Invoice, InvoiceError> uses http, clock {
  return http.post("/invoices", { orderId, issuedAt: clock.now() });
}
