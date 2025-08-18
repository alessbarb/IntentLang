intent "Notification service" tags ["notifications"]

uses {
  http: Http { baseUrl: "https://api.example.com", timeoutMs: 3000 },
}

types {
  type NotificationId = Uuid;
  type Notification = {
    id: NotificationId,
    userId: Uuid,
    message: String,
  };
  type NotificationError = { code: Int, message: String };
}

effect sendNotification(input: { userId: Uuid, message: String }): Result<Notification, NotificationError> uses http {
  // v0.2: implement
}
