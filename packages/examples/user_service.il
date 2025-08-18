intent "User service" tags ["api","users"]

uses {
  http: Http { baseUrl: "https://api.example.com", timeoutMs: 2500 },
  clock: Clock {},
}

types {
  type Email = String brand "Email" where matches("^[^@]+@[^@]+\\.[^@]+$");
  type UserId = Uuid;
  type User = {
    id: UserId,
    name: String where _.length >= 2,
    email: Email,
    createdAt: DateTime,
  };
  type ApiError = { code: Int, message: String };
}

func toEmail(s: String): Result<Email, String> {
  // v0.2: implement
}

effect createUser(input: { name: String, email: Email }): Result<User, ApiError> uses http, clock {
  // v0.2: implement
}
