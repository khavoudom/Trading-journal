/** User record as stored in the database. */
export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  createdAt: string;
}

/** Response returned after a successful authentication (register or login). */
export interface AuthResponse {
  user: User;
  token: string;
}

/** Shape of the JWT payload after decoding. */
export interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}
