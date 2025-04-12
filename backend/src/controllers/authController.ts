import { Request, Response } from "express";

import bcrypt from "bcryptjs";


import pool from "../config/dbconfig";
import asyncHandler from "../middlwares/asyncHandler";
import { generateToken } from "../utils/helpers/generateToken";

// 🔹 REGISTER USER
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role_id } = req.body;

  // Check if user already exists
  const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (userExists.rows.length > 0) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insert New User
  const newUser = await pool.query(
    "INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role_id",
    [name, email, hashedPassword, role_id]
  );

  // Generate JWT Token
  const accessToken = generateToken(res, newUser.rows[0].id, newUser.rows[0].role_id);

  res.status(201).json({
    message: "User registered successfully",
    access_token: accessToken,
    user: newUser.rows[0],
  });
});

// 🔹 LOGIN USER
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if user exists
  const userQuery = await pool.query(
    `SELECT users.id, users.name, users.email, users.password, users.role_id, user_roles.role_name
     FROM users
     JOIN user_roles ON users.role_id = user_roles.id
     WHERE email = $1`,
    [email]
  );

  if (userQuery.rows.length === 0) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Compare Passwords
  const user = userQuery.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Generate JWT Token
  const accessToken = generateToken(res, user.id, user.role_id);

  res.status(200).json({
    message: "Login successful",
    access_token: accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
    },
  });
});

// 🔹 LOGOUT USER
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    expires: new Date(0),
  });

  res.status(200).json({ message: "User logged out successfully" });
});
