import { Router } from "express";
import { getUsers, getUser, updateRole, updateStatus, deleteUser } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { updateRoleSchema, updateStatusSchema, listUsersQuery } from "../services/user.service.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// all user management routes require admin role
router.use(protect, authorize(ROLES.ADMIN));

router.get("/", validateQuery(listUsersQuery), getUsers);
router.get("/:id", getUser);
router.patch("/:id/role", validate(updateRoleSchema), updateRole);
router.patch("/:id/status", validate(updateStatusSchema), updateStatus);
router.delete("/:id", deleteUser);

export default router;
