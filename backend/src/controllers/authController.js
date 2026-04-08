import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/jwt.js";
import { 
  loginSchema, 
  registerSchema, 
  profileUpdateSchema, 
  changePasswordSchema 
} from "../validators/authValidators.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const err = new Error("Validation error");
    err.statusCode = 400;
    err.errorCode = "VALIDATION_ERROR";
    err.details = error.details;
    throw err;
  }
  return value;
};

export const register = async (req, res, next) => {
  try {
    const data = validate(registerSchema, req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      const err = new Error("Email already registered");
      err.statusCode = 409;
      err.errorCode = "EMAIL_EXISTS";
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      role: data.role || "user"
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          address: user.address
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = validate(loginSchema, req.body);

    const user = await User.findOne({ email: data.email });
    if (!user) {
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      err.errorCode = "INVALID_CREDENTIALS";
      throw err;
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      err.errorCode = "INVALID_CREDENTIALS";
      throw err;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          address: user.address
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "refreshToken is required"
      });
    }

    // Gracefully handle token expiration
    const decoded = await new Promise((resolve, reject) => {
      import("jsonwebtoken").then(({ default: jwt }) => {
        jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, (err, payload) => {
          if (err) resolve(null); // Return null on error instead of throwing a 500
          else resolve(payload);
        });
      });
    });

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is expired or invalid"
      });
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    const accessToken = generateAccessToken(user);

    res.json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Không tiết lộ email không tồn tại
      return res.json({
        success: true,
        message: "If that email exists, reset instructions have been sent"
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expires;
    await user.save();

    // Mock gửi email: trả token về response để test
    res.json({
      success: true,
      data: {
        resetToken,
        expires
      }
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "token and newPassword are required"
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      const err = new Error("Invalid or expired reset token");
      err.statusCode = 400;
      err.errorCode = "INVALID_OR_EXPIRED_TOKEN";
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    next(error);
  }
};export const updateProfile = async (req, res, next) => {
  try {
    const data = validate(profileUpdateSchema, req.body);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.fullName = data.fullName;
    user.phone = data.phone;
    user.address = data.address;
    await user.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          address: user.address
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const data = validate(changePasswordSchema, req.body);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      const err = new Error("Current password incorrect");
      err.statusCode = 401;
      err.errorCode = "INCORRECT_PASSWORD";
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(data.newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    next(error);
  }
};



export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const avatarUrl = await uploadBufferToCloudinary(req.file, "hotel-booking/avatars", "avatar");
    
    // Update user record
    const user = await User.findById(req.user._id);
    if (user) {
      user.avatar = avatarUrl;
      await user.save();
    }

    res.json({
      success: true,
      data: { avatarUrl }
    });
  } catch (error) {
    next(error);
  }
};

