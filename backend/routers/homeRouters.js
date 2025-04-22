const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const authMiddleware = require("../middlewares/authMiddleware")




router.get('/',homeController.homeShow);
router.get('/calendar',homeController.calendarShow);
router.get('/calendarData',homeController.calendarShowData);

router.get('/todolist',homeController.todolistShow);

router.get('/plan',homeController.planShow );

router.get('/profile',homeController.profileShow );
router.get('/data',homeController.dataShow );



// router.get('/',authMiddleware,homeController.homeShow);
// router.get('/calendar',authMiddleware,homeController.calendarShow);

// router.get('/todolist',authMiddleware,homeController.todolistShow);

// router.get('/plan',authMiddleware,homeController.planShow );

// router.get('/profile',authMiddleware,homeController.profileShow );
// router.get('/data',authMiddleware,homeController.dataShow );



module.exports= router;