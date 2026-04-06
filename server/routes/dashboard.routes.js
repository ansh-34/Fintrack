import { Router } from "express";
import { summary, categories, trends, recent, paymentMethods } from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// all dashboard routes require authentication (any role can view)
router.use(protect);

router.get("/summary", summary);
router.get("/categories", categories);
router.get("/trends", trends);
router.get("/recent", recent);
router.get("/payment-methods", paymentMethods);

export default router;
