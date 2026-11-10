import { Router } from "express";
import { login, logout, me } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validators/auth.validator.js";

const router = Router();

router.route("/login").post(validate(loginSchema), login);
router.route("/logout").post(logout);
router.route("/me").get(me);

export default router;
