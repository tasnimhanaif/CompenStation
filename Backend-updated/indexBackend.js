// indexBackend.js
// Matches: Frontend/index.html
// Serves as the root-level backend entry for the login/landing page
// Handles health check and root-level routes corresponding to the index (login) page

const express = require("express");
const router = express.Router();

// GET / — Health check / root route (mirrors index.html landing page)
router.get("/", (req, res) => {
  res.json({ message: "CompenStation API is running", status: "ok" });
  });

  // GET /health — Health check endpoint
  router.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    module.exports = router;
