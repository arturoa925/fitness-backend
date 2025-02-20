const router = require("express").Router();
const { Users, Exercise } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/connection");
const tokenauth = require("../utils/tokenauth");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const JWT_SECRET = process.env.JWT_SECRET;

// * Create a new user
router.post("/signup", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, email, password } = req.body;
    console.log("Request Body:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // * Check if user already exists
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await Users.create(
      {
        id: uuidv4(),
        name: name,
        email: email,
        password: password,
      },
      { transaction }
    );

    await transaction.commit();

    // * Create a token
    const token = jwt.sign(
      { id: newUser.id, userName: newUser.userName },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ user: newUser, token });
  } catch (err) {
    await transaction.rollback();
    console.error("Error creating user:", err);
    res.status(400).json(err);
  }
});

// * Login user
router.post("/login", async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Missing userName or password" });
    }

    const user = await Users.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // * Create a token
    const token = jwt.sign(
      { id: user.id, userName: user.userName },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ user, token });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(400).json(err);
  }
});

// * Logout user
router.post("/logout", tokenauth, async (req, res) => {
  try {
    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.error("Error logging out:", err);
    res.status(400).json(err);
  }
});

module.exports = router;
