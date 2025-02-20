const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/connection");

class WorkoutExercises extends Model {}

WorkoutExercises.init(
    {
        workoutId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Workouts",
                key: "id",
            },
        },
        exerciseId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Exercises",
                key: "id",
            },
        },
        workoutDate: {
            type: DataTypes.STRING, 
            allowNull: false,
          },
    },
    {
        sequelize,
        modelName: "WorkoutExercise",
        tableName: "WorkoutExercises",
        timestamps: false
    }
);

module.exports = WorkoutExercises;