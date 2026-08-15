/**
 * Authentication routes: signup, login, logout.
 */

import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db/index.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = Router();

const findUserByEmail = db.prepare("SELECT * FROM users WHERE email = ?");
const insertUser = db.prepare(
  "INSERT INTO users (email, password_hash) VALUES (?, ?)"
);

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const normalized = email.toLowerCase().trim();
  if (findUserByEmail.get(normalized)) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = insertUser.run(normalized, passwordHash);
  const user = { id: result.lastInsertRowid, email: normalized };
  res.status(201).json({ token: signToken(user), user: { id: user.id, email: user.email } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = findUserByEmail.get(email.toLowerCase().trim());
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });

  res.json({
    token: signToken({ id: user.id, email: user.email }),
    user: { id: user.id, email: user.email },
  });
});

router.post("/logout", requireAuth, (_req, res) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
