const express = require("express");
const router = express.Router();
const eventRouters = require("./eventRoutes")
const userRouters = require("./userRoutes")
const authRouters = require("./authRouter")
const homeRouters = require("./homeRouters")
const todolistRouters = require("./todolistRouter")
const taskRouters = require("./taskRouters")
const notFoundRouters = require("../middlewares/notFound")



router.use("/home", homeRouters)
router.use('/event', eventRouters);
router.use('/user', userRouters);
router.use('/todolist', todolistRouters);
router.use('/task', taskRouters);
router.use('/auth', authRouters);


// router.use(notFoundRouters)




module.exports = router;