import dotenv from "dotenv";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

dotenv.config();

const ACCESS_TOKEN_EXPIRES_IN = "3h";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

interface TokenUser {
  _id: string | object;
  role?: string;
}

export const generateAccessToken = (user: TokenUser): string => {
  if (!ACCESS_SECRET) {
    throw new Error("JWT access secret is not configured");
  }
  return jwt.sign(
    {
      sub: user._id,
      role: user.role,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN } as SignOptions
  );
};

export const generateRefreshToken = (user: TokenUser): string => {
  if (!REFRESH_SECRET) {
    throw new Error("JWT refresh secret is not configured");
  }
  return jwt.sign(
    {
      sub: user._id,
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as SignOptions
  );
};

export const verifyAccessToken = (token: string): JwtPayload | string => {
  if (!ACCESS_SECRET) {
    throw new Error("JWT access secret is not configured");
  }
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string): JwtPayload | string => {
  if (!REFRESH_SECRET) {
    throw new Error("JWT refresh secret is not configured");
  }
  return jwt.verify(token, REFRESH_SECRET);
};
