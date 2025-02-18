const router = require("express").Router();
const { Users, Exercise, Workout } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sequelize = require("../config/connection");
const tokenauth = require("../utils/tokenauth");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const JWT_SECRET = process.env.JWT_SECRET;
const { Op } = require("sequelize");

router.post("/dailyworkout", async (req, res) => {
  try {
    const { user_id } = req.body; // Extract user ID

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // * Get today's date in YYYY-MM-DD format
    const todayDate = new Date().toISOString().split("T")[0]; // Convert to "YYYY-MM-DD"

    let workout = await Workout.findOne({
      where: {
        user_id, // Filter by user
        workoutDate: todayDate, // 🔥 Match by clean date format
      },
      include: [{ model: Exercise }],
    });

    if (workout) {
      return res
        .status(200)
        .json({ message: "Workout already exists for today", workout });
    }

    // * Fetch all exercises from the database
    const allExercises = await Exercise.findAll();

    if (!allExercises || allExercises.length === 0) {
      return res.status(404).json({ message: "No exercises found!" });
    }

    // * Shuffle exercises and pick 4
    const workoutSize = 4;
    const shuffledExercises = allExercises.sort(() => 0.5 - Math.random());
    const selectedExercises = shuffledExercises.slice(0, workoutSize);

    console.log(
      "✅ Selected Exercises:",
      selectedExercises.map((e) => `${e.id} - ${e.name}`)
    );

    // * Create a new workout for today
    workout = await Workout.create({
      id: uuidv4(),
      user_id,
      workoutDate: todayDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await workout.reload(); // Ensure Sequelize refreshes the instance
    console.log("✅ Workout ID:", workout.id);

    if (!workout.id) {
      return res
        .status(500)
        .json({ message: "Workout ID is missing after creation!" });
    }

    // * Associate exercises with the new workout
    await workout.addExercises(selectedExercises.map((ex) => ex.id));

    // * Retrieve the newly created workout with exercises
    const newWorkout = await Workout.findOne({
      where: { id: workout.id },
      include: [{ model: Exercise, through: { attributes: [] } }], // Ensure it's using the join table
    });

    res
      .status(201)
      .json({ message: "New workout created", workout: newWorkout });
  } catch (err) {
    console.error("Error generating daily workout:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.post("/workoutdate", async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { date, user_id } = req.body; // Extract the selected date from the request

    if (!date || !user_id) {
      return res.status(400).json({ message: "Date and user ID are required" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const utcDate = new Date(`${date}T00:00:00Z`).toISOString().split("T")[0];

    // Find a workout associated with the selected date
    const workout = await Workout.findOne({
      where: { user_id, workoutDate: utcDate }, // 🔥 Match exact date
      include: [{ model: Exercise }],
    });
    console.log(`Searching for workout: user_id=${user_id}, date=${utcDate}`);

    if (!workout) {
      return res
        .status(404)
        .json({ message: "No workout found for this date" });
    }

    res.status(200).json({ workout });
  } catch (err) {
    console.error("Error fetching workout:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// * proxy route for Pexels API
router.get("/pexels", async (req, res) => {
  try {
    const query = req.query.q || "workout";
    const apiKey = process.env.PEXELS_API_KEY;

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=10`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch images from Pexels" });
  }
});

// * Get all exercises for a user
router.post("/exercises", async (req, res) => {
  try {
    const { user_id } = req.body; // Extract user ID

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const exercises = await Workout.findAll({
      where: { user_id },
      include: [{ model: Exercise }],
    });

    res.status(200).json({ exercises });
  } catch (err) {
    console.error("Error fetching exercises:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

module.exports = router;
