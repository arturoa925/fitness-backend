const { Users, Exercise, Workout } = require('../models');
const usersData = require('./users.json');
const exerciseData = require('./exercise.json');
const workoutData = require('./workout.json');

const sequelize = require('../config/connection');

const seedDatabase = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log("✅ Database synced!");

        // Step 1: Create a Single User
        const [user] = await Users.bulkCreate(usersData, {
            individualHooks: true,
            returning: true,
        });

        console.log(`✅ Created User: ${user.id}`);

        // Step 2: Seed Exercises
        const exercises = await Exercise.bulkCreate(exerciseData);
        console.log("✅ Exercises seeded!");

        // Step 3: Assign all workouts to the created user
        const workoutsWithUser = workoutData.map((workout) => ({
            ...workout,
            user_id: user.id, // Assign the first user to all workouts
        }));

        const workouts = await Workout.bulkCreate(workoutsWithUser);
        console.log("✅ Workouts seeded!");

        console.log("🚀 Database seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
}

seedDatabase();