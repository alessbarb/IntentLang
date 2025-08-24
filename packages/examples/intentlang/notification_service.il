intent "Notification service" tags ["notifications"]

uses {
  http: Http { baseUrl: "https://api.example.com", timeoutMs: 3000 },
}

types {
  type NotificationId = String;
  type Notification = {
    id: NotificationId,
    userId: String,
    message: String,
  };
  type NotificationError = { code: Int, message: String };
}

effect sendNotification(input: { userId: String, message: String }): Result<Notification, NotificationError> uses http {
  return http.post("/notifications", input);
}
