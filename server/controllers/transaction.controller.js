import * as txService from "../services/transaction.service.js";
import { sendSuccess, paginationMeta } from "../utils/response.js";

export const create = async (req, res, next) => {
  try {
    const tx = await txService.createTransaction(req.body, req.user._id);
    return sendSuccess(res, tx, 201);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { transactions, total, page, limit } = await txService.getTransactions(req.query);
    return sendSuccess(res, transactions, 200, paginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const tx = await txService.getTransactionById(req.params.id);
    return sendSuccess(res, tx);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const tx = await txService.updateTransaction(req.params.id, req.body, req.user);
    return sendSuccess(res, tx);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await txService.deleteTransaction(req.params.id, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
