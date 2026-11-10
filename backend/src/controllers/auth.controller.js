import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const COOKIE_NAME = "token";

const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SECURE === "true" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
});

export const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
        throw new ApiError(401, "Invalid username or password");
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.status(200).json(new ApiResponse(200, { username }, "Logged in successfully"));
});

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie(COOKIE_NAME, cookieOptions());
    return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

export const me = asyncHandler(async (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(200).json(new ApiResponse(200, { authenticated: false }, "Not authenticated"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json(new ApiResponse(200, { authenticated: true, username: decoded.username }, "Authenticated"));
    } catch {
        return res.status(200).json(new ApiResponse(200, { authenticated: false }, "Not authenticated"));
    }
});
