import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../../config/db";
import { env, getJwtSecret } from "../../config/env";
import type { PublicUser, UserRole, UserRow } from "../../types";

export const toPublicUser = (user: UserRow): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
  updated_at: user.updated_at
});

export const findUserByEmail = async (email: string): Promise<UserRow | null> => {
  const result = await query<UserRow>("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase()
  ]);
  return result.rows[0] ?? null;
};

export const createUser = async (
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<PublicUser> => {
  const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds);
  const result = await query<UserRow>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, password, role, created_at, updated_at`,
    [name.trim(), email.toLowerCase(), hashedPassword, role]
  );

  return toPublicUser(result.rows[0]);
};

export const verifyPassword = (password: string, hashedPassword: string): Promise<boolean> =>
  bcrypt.compare(password, hashedPassword);

export const signToken = (user: PublicUser): string =>
  jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role
    },
    getJwtSecret(),
    { expiresIn: env.jwtExpiresIn }
  );
