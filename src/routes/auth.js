import * as controllers from "../controllers";
import express from "express";

const router = express.Router();

router.post("/register", controllers.register);
router.post("/login", controllers.login);
router.post("/sendMail/:email", controllers.sendMail);
router.post("/sendMailPassword/:email", controllers.sendMailForgot);
router.get("/verify/:email", controllers.verifyAccount);
router.get("/forgotPassword/:email", controllers.forgotPassword);

module.exports = router;
