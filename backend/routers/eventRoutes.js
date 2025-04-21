const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware")
const eventController =require("../controllers/eventController");


// router.get("/",authMiddleware,eventController.getEvent);
// router.post("/create",authMiddleware,eventController.createEvent);
// router.put("/edit",authMiddleware,eventController.editEvent);
// router.delete("/delete",authMiddleware,eventController.deleteEvent);


router.post("/create",eventController.createEvent);
router.put("/update/:id",eventController.updateEvent);
router.delete("/delete/:id",eventController.deleteEvent);
router.get("/:id",eventController.getEventDetails);

// notification
router.post("/disable-reminder",eventController.disableNotification);
router.post("/set-reminder",eventController.setNotification);


router.get("/",eventController.getEvent);







module.exports = router;