import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

if (!Number.isInteger(saltRounds) || saltRounds < 8 || saltRounds > 12) {
  throw new Error("BCRYPT_SALT_ROUNDS must be an integer between 8 and 12");
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"],
  bcryptSaltRounds: saltRounds,
  corsOrigins: (process.env.CORS_ORIGIN ?? "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
};
