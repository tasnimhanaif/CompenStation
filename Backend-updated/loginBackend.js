// loginBackend.js
// Matches: Frontend/js/login.js
// Handles authentication API routes (login, register)

const express = require("express");
const router = express.Router();
const store = require("./Store/storeMemory");

// POST /auth/login — Authenticate a user and return user info
router.post("/auth/login", async (req, res) => {
    try {
          const { username, password } = req.body;
          if (!username || !password) {
                  return res.status(400).json({ error: "Username and password are required" });
          }
          const user = await store.findUserByCredentials(username, password);
          if (!user) {
                  return res.status(401).json({ error: "Invalid username or password" });
          }
          res.json({ user: { id: user.id, fullName: user.fullName, role: user.role, email: user.email } });
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

// POST /auth/register — Register a new user account
router.post("/auth/register", async (req, res) => {
    try {
          const { fullName, email, phone, username, password, role, employeeId, jobTitle } = req.body;
          if (!fullName || !email || !username || !password) {
                  return res.status(400).json({ error: "Required fields are missing" });
          }
          const newUser = await store.createUser({ fullName, email, phone, username, password, role: role || "employee", employeeId, jobTitle });
          res.json({ user: { id: newUser.id, fullName: newUser.fullName, role: newUser.role, email: newUser.email } });
    } catch (e) {
          res.status(400).json({ error: e.message });
    }
});

module.exports = router;
