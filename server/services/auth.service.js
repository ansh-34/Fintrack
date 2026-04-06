import Joi from "joi";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { generateToken } from "../middleware/auth.js";
import { ROLE_LIST } from "../config/constants.js";

// --- validation schemas ---
export const registerSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string()
    .valid(...ROLE_LIST)
    .optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

// --- service functions ---
export const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("Email already registered");
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Account is deactivated. Contact admin.");
  }

  const token = generateToken(user._id);
  // remove password from response
  user.password = undefined;

  return { user, token };
};
