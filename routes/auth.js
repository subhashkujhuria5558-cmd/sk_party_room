const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ✅ Google Login route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Google Callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // User mil gaya -> JWT token generate
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // frontend ke url pe redirect karke token bhejna
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

// ✅ Logout route
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = router;
