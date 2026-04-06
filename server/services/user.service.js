import Joi from "joi";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { ROLE_LIST } from "../config/constants.js";

// --- validation schemas ---
export const updateRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...ROLE_LIST)
    .required(),
});

export const updateStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

export const listUsersQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().allow("").optional(),
  role: Joi.string()
    .valid(...ROLE_LIST)
    .optional(),
  sortBy: Joi.string().valid("name", "email", "createdAt", "role").default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
});

// --- service functions ---
export const getUsers = async (query) => {
  const { page, limit, search, role, sortBy, order } = query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role) {
    filter.role = role;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: order === "asc" ? 1 : -1 };

  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, total, page, limit };
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

export const updateUserRole = async (id, role, requesterId) => {
  if (id === requesterId) {
    throw ApiError.badRequest("You cannot change your own role");
  }
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("User not found");

  user.role = role;
  await user.save();
  return user;
};

export const updateUserStatus = async (id, isActive, requesterId) => {
  if (id === requesterId) {
    throw ApiError.badRequest("You cannot change your own status");
  }
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("User not found");

  user.isActive = isActive;
  await user.save();
  return user;
};

export const deleteUser = async (id, requesterId) => {
  if (id === requesterId) {
    throw ApiError.badRequest("You cannot delete your own account");
  }
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("User not found");

  await User.findByIdAndDelete(id);
  return { message: "User deleted successfully" };
};
