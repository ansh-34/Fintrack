import * as dashService from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/response.js";

export const summary = async (_req, res, next) => {
  try {
    const data = await dashService.getSummary();
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const categories = async (req, res, next) => {
  try {
    const data = await dashService.getCategoryBreakdown(req.query.type);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const trends = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const data = await dashService.getMonthlyTrends(months);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const recent = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await dashService.getRecentActivity(limit);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const paymentMethods = async (_req, res, next) => {
  try {
    const data = await dashService.getPaymentMethodBreakdown();
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
