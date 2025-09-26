// routes/auth.js
const express = require("express");
const passport = require("passport");

const router = express.Router();

// Step 1: Google login start
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2: Callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // login success hone ke baad yaha aayega
    res.redirect("/dashboard"); 
  }
);

module.exports = router;
