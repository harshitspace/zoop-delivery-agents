import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

export const requireAuth = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return next(new ApiError(401, "Authentication required"));
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        next(new ApiError(401, "Invalid or expired session"));
    }
};
