const express = require("express");
const router = express.Router();
const taskRouters = require("../controllers/taskController")

router.post("/create",taskRouters.createTask);
router.put("/update/:id",taskRouters.updateTask);
router.delete("/delete/:id",taskRouters.deleteTask);

module.exports= router;

