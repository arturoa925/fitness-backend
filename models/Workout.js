const { Model, DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/connection");

class Workout extends Model {}

Workout.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        workoutDate: {
            type: DataTypes.STRING, // Store as "YYYY-MM-DD"
            allowNull: false,
          },
    },
    {
        sequelize,
        modelName: "Workout",
        tableName: "Workouts",
    }
);

module.exports = Workout;