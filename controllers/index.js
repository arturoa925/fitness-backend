const router = require("express").Router();

router.use("/users", require("./users"));
router.use("/exercise", require("./exercises"));

module.exports = router;