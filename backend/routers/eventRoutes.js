const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware")
const eventController =require("../controllers/eventController");
const notificationController =require("../controllers/notificationController");


// router.get("/",authMiddleware,eventController.getnotificationControllerEvent);
// router.post("/create",authMiddleware,eventController.createEvent);
// router.put("/edit",authMiddleware,eventController.editEvent);
// router.delete("/delete",authMiddleware,eventController.deleteEvent);


router.post("/create",eventController.createEvent);
router.put("/update/:id",eventController.updateEvent);
router.delete("/delete/:id",eventController.deleteEvent);
router.get("/:id",eventController.getEventDetails);

// notification
router.post("/disable-reminder/:id",notificationController.disableReminder);
router.post("/set-reminder/:id",notificationController.setNotification);


router.get("/",eventController.getEvent);







module.exports = router;