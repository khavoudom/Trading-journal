/** A trading space that groups trades and plans under a user account. */
export interface Space {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}
