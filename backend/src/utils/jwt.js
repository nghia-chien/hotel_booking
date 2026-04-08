import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const ACCESS_TOKEN_EXPIRES_IN = "3h";
const REFRESH_TOKEN_EXPIRES_IN = "5h";

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

export const generateAccessToken = (user) => {
  if (!ACCESS_SECRET) {
    throw new Error("JWT access secret is not configured");
  }
  return jwt.sign(
    {
      sub: user._id,
      role: user.role
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

export const generateRefreshToken = (user) => {
  if (!REFRESH_SECRET) {
    throw new Error("JWT refresh secret is not configured");
  }
  return jwt.sign(
    {
      sub: user._id
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

export const verifyAccessToken = (token) => {
  if (!ACCESS_SECRET) {
    throw new Error("JWT access secret is not configured");
  }
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  if (!REFRESH_SECRET) {
    throw new Error("JWT refresh secret is not configured");
  }
  return jwt.verify(token, REFRESH_SECRET);
};

