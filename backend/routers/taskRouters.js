const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const upload = require('../middlewares/uploadFile/upload');



router.get("/searchListTask",taskController.searchListTask);
router.post("/create",upload.single('taskFile'),taskController.createTask);
router.put("/submitTask/:id",upload.single('taskFile'),taskController.submitTask);
router.put("/update/:id",taskController.updateTask);
router.delete("/delete/:id",taskController.deleteTask);
router.patch("/patch/:id",taskController.patchTask);

router.get("/downloads/:id",taskController.downloadFile);  
router.delete("/deleteFile/:id",taskController.deleteFile);  
module.exports= router;

