import Joi from "joi";
import Transaction from "../models/Transaction.js";
import ApiError from "../utils/ApiError.js";
import { TX_TYPE_LIST, PAYMENT_METHODS, CATEGORIES, ROLES } from "../config/constants.js";

// --- validation schemas ---
export const createTxSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  type: Joi.string()
    .valid(...TX_TYPE_LIST)
    .required(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .required(),
  date: Joi.date().iso().required(),
  description: Joi.string().trim().max(500).allow("").default(""),
  merchant: Joi.string().trim().max(200).allow("").default(""),
  paymentMethod: Joi.string()
    .valid(...PAYMENT_METHODS)
    .default("cash"),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).default([]),
});

export const updateTxSchema = Joi.object({
  amount: Joi.number().positive().precision(2),
  type: Joi.string().valid(...TX_TYPE_LIST),
  category: Joi.string().valid(...CATEGORIES),
  date: Joi.date().iso(),
  description: Joi.string().trim().max(500).allow(""),
  merchant: Joi.string().trim().max(200).allow(""),
  paymentMethod: Joi.string().valid(...PAYMENT_METHODS),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10),
}).min(1);

export const listTxQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid(...TX_TYPE_LIST).optional(),
  category: Joi.string().valid(...CATEGORIES).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  search: Joi.string().trim().allow("").optional(),
  merchant: Joi.string().trim().optional(),
  paymentMethod: Joi.string().valid(...PAYMENT_METHODS).optional(),
  sortBy: Joi.string().valid("date", "amount", "createdAt").default("date"),
  order: Joi.string().valid("asc", "desc").default("desc"),
  tag: Joi.string().trim().optional(),
});

// --- service functions ---
export const createTransaction = async (data, userId) => {
  const tx = await Transaction.create({ ...data, createdBy: userId });
  return tx;
};

export const getTransactions = async (query) => {
  const { page, limit, type, category, startDate, endDate, search, merchant, paymentMethod, sortBy, order, tag } = query;

  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (merchant) filter.merchant = { $regex: merchant, $options: "i" };
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (tag) filter.tags = tag;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: "i" } },
      { merchant: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: order === "asc" ? 1 : -1 };

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  return { transactions, total, page, limit };
};

export const getTransactionById = async (id) => {
  const tx = await Transaction.findById(id).populate("createdBy", "name email");
  if (!tx) throw ApiError.notFound("Transaction not found");
  return tx;
};

export const updateTransaction = async (id, data, user) => {
  const tx = await Transaction.findById(id);
  if (!tx) throw ApiError.notFound("Transaction not found");

  // analysts can only update their own records
  if (user.role !== ROLES.ADMIN && tx.createdBy.toString() !== user._id.toString()) {
    throw ApiError.forbidden("You can only edit your own transactions");
  }

  Object.assign(tx, data);
  await tx.save();

  return Transaction.findById(id).populate("createdBy", "name email");
};

export const deleteTransaction = async (id, user) => {
  const tx = await Transaction.findById(id);
  if (!tx) throw ApiError.notFound("Transaction not found");

  if (user.role !== ROLES.ADMIN && tx.createdBy.toString() !== user._id.toString()) {
    throw ApiError.forbidden("You can only delete your own transactions");
  }

  // soft delete
  tx.isDeleted = true;
  tx.deletedAt = new Date();
  await tx.save();

  return { message: "Transaction deleted successfully" };
};
