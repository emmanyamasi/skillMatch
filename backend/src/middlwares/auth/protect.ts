import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";



import pool from "../../config/dbconfig";
import asyncHandler from "../asyncHandler";
import { UserRequest } from "../../utils/types/userTypes";

// Auth middleware to protect routes
export const protect = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;
    console.log("Request Headers:", req.headers);
    console.log("Request Cookies:", req.cookies);

    // 1️⃣ Extract Token from Authorization Header or Cookies
    if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.access_token) {
        token = req.cookies.access_token;
    }

    // 2️⃣ If No Token, Send Error Response
    if (!token || token.trim() === "") {
        console.log("No token found in request");
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        // 3️⃣ Ensure JWT_SECRET is Set
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        console.log("Token before verification:", token);

        // 4️⃣ Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number; roleId: number };

        console.log("Decoded Token:", decoded);
        console.log("🛑 Extracted userId before conversion:", decoded.userId, "Type:", typeof decoded.userId)


        // 5️⃣ Convert userId to Number Only If Needed
        // const userId = typeof decoded.userId === "string" ? parseInt(decoded.userId, 10) : decoded.userId;
        // console.log("🔢 Converted userId:", userId, "Type:", typeof userId);
        // if (isNaN(userId)) {
        //     return res.status(400).json({ message: "Invalid ID in token" });
        // }




        const userId = decoded.userId;
        if (typeof userId !== "number" || isNaN(userId)) {
            throw new Error("Invalid user_id in token");
        }

        // 6️⃣ Fetch User from Database
        const userQuery = await pool.query(
            `SELECT 
             users.id as id, 
              users.name as name, 
              users.email as email, 
              users.role_id as role_id, 
              user_roles.role_name as role_name
             FROM users 
             JOIN user_roles ON users.role_id = user_roles.id 
             WHERE users.id = $1`,
            [userId]
        );

        console.log("📝 User Query Result:", userQuery.rows);

        if (userQuery.rows.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        // 7️⃣ Attach User to Request and Proceed
        req.user = userQuery.rows[0];
        console.log("👤 Final req.user:", req.user);
        next();
    } catch (error) {
        console.error("JWT Error:", error);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
});
