import { Router } from "express";
import { create, getAll, getOne, update, remove } from "../controllers/transaction.controller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { createTxSchema, updateTxSchema, listTxQuery } from "../services/transaction.service.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// all transaction routes require authentication
router.use(protect);

router.get("/", validateQuery(listTxQuery), getAll);
router.get("/:id", getOne);

// create, update, delete require analyst or admin
router.post("/", authorize(ROLES.ANALYST, ROLES.ADMIN), validate(createTxSchema), create);
router.patch("/:id", authorize(ROLES.ANALYST, ROLES.ADMIN), validate(updateTxSchema), update);
router.delete("/:id", authorize(ROLES.ANALYST, ROLES.ADMIN), remove);

export default router;
