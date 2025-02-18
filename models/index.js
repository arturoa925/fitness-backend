const Users = require("./Users");
const Exercise = require("./Exercise");
const Workout = require("./Workout");
const WorkoutExercise = require("./WorkoutExercise");

// * users can have many workouts

Users.hasMany(Workout, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

Workout.belongsTo(Users, {
  foreignKey: "user_id",
});

// * workouts can have many exercises

Workout.belongsToMany(Exercise, { through: "WorkoutExercises", foreignKey: "workoutId"  });

Exercise.belongsToMany(Workout, { through: "WorkoutExercises", foreignKey: "exerciseId"  });

module.exports = { Users, Exercise, Workout, WorkoutExercise };
