export type OrderId = string;
export interface Order {
  id: OrderId;
  userId: string;
  total: number;
}
export interface OrderError {
  code: number;
  message: string;
}

export async function createOrder(
  deps: { http: Http; random: Random },
  input: { userId: string; total: number },
): Promise<Result<Order, OrderError>> {
  // v0.2: implement
}
