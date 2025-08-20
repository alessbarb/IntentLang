intent "Invoice service" tags ["billing","invoice"]

uses {
  http: Http { baseUrl: "https://api.example.com", timeoutMs: 3000 },
  clock: Clock {},
}

types {
  type InvoiceId = Uuid;
  type Invoice = {
    id: InvoiceId,
    orderId: Uuid,
    issuedAt: DateTime,
  };
  type InvoiceError = { code: Int, message: String };
}

effect generateInvoice(orderId: Uuid): Result<Invoice, InvoiceError> uses http, clock {
  return http.post("/invoices", { orderId, issuedAt: clock.now() });
}
