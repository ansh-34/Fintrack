import * as userService from "../services/user.service.js";
import { sendSuccess } from "../utils/response.js";
import { paginationMeta } from "../utils/response.js";

export const getUsers = async (req, res, next) => {
  try {
    const { users, total, page, limit } = await userService.getUsers(req.query);
    return sendSuccess(res, users, 200, paginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const user = await userService.updateUserRole(
      req.params.id,
      req.body.role,
      req.user._id.toString()
    );
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const user = await userService.updateUserStatus(
      req.params.id,
      req.body.isActive,
      req.user._id.toString()
    );
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(
      req.params.id,
      req.user._id.toString()
    );
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
