import * as authService from "../services/auth.service.js";
import { sendTokenCookie } from "../middleware/auth.js";
import { sendSuccess } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    sendTokenCookie(res, token);
    return sendSuccess(res, { user, token }, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.loginUser(req.body);
    sendTokenCookie(res, token);
    return sendSuccess(res, { user, token });
  } catch (err) {
    next(err);
  }
};

export const logout = async (_req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  return sendSuccess(res, { message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user });
};
