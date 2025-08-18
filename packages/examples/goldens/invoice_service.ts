export type InvoiceId = string;
export interface Invoice {
  id: InvoiceId;
  orderId: string;
  issuedAt: Date;
}
export interface InvoiceError {
  code: number;
  message: string;
}

export async function generateInvoice(
  deps: { http: Http; clock: Clock },
  orderId: string,
): Promise<Result<Invoice, InvoiceError>> {
  // v0.2: implement
}
