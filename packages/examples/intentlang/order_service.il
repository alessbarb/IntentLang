intent "Order service" tags ["api","orders"]

uses {
  http: Http { baseUrl: "https://api.example.com", timeoutMs: 3000 },
  random: Random { seed: 42 },
}

types {
  type OrderId = String;
  type Order = {
    id: OrderId,
    userId: String,
    total: Float where _ >= 0,
  };
  type OrderError = { code: Int, message: String };
}

effect createOrder(input: { userId: String, total: Float }): Result<Order, OrderError> uses http, random {
  let id = random.next().toString();
  return http.post("/orders", { id: brand<OrderId>(id), userId: input.userId, total: input.total });
}
