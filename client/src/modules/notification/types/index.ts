/** GET /notifications/me javobi */
export interface AppNotification {
  id: string;
  title: string;
  body: string | null;
  type: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}
