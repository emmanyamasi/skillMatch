import { Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const generateToken = (res: Response, userId: string, roleId: number) => {
    // Load environment variables
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    // Ensure secrets exist
    if (!jwtSecret || !refreshSecret) {
        console.error("❌ JWT_SECRET or REFRESH_TOKEN_SECRET is missing in environment variables");
        throw new Error("Authentication secrets are missing. Please check your environment variables.");
    }

    try {
        // Generate tokens
        const accessToken = jwt.sign({ userId, roleId }, jwtSecret, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId }, refreshSecret, { expiresIn: "30d" });

        // Set HTTP-Only Cookies
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development", // Secure in production
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        console.log("✅ Tokens generated successfully");

        return { accessToken, refreshToken }; // Optional, depending on usage
    } catch (error) {
        console.error("❌ Error generating JWT:", error);
        throw new Error("Error generating authentication tokens");
    }
};
