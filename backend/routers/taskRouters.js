const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const upload = require('../middlewares/uploadFile/upload');
const { exportTasksToExcel } = require('../middlewares/exportExcel');


router.get("/searchListTask",taskController.searchListTask);
router.post("/searchListFile",taskController.searchListFile);
router.post("/create",upload.single('taskFile'),taskController.createTask);
router.put("/submitTask/:id",upload.single('taskFile'),taskController.submitTask);
router.put("/update/:id",taskController.updateTask);
router.delete("/delete/:id",taskController.deleteTask);
router.patch("/patch/:id",taskController.patchTask);

router.get("/downloads/:id",taskController.downloadFile);  
router.delete("/deleteFile/:id",taskController.deleteFile);  

router.post("/stats",taskController.stats);

router.get('/exportExcel', exportTasksToExcel);

module.exports= router;

