export type NotificationId = string;
export interface Notification {
  id: NotificationId;
  userId: string;
  message: string;
}
export interface NotificationError {
  code: number;
  message: string;
}

export async function sendNotification(
  deps: { http: Http },
  input: { userId: string; message: string },
): Promise<Result<Notification, NotificationError>> {
  // v0.2: implement
}
