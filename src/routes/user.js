import * as userController from "../controllers/UserController";
import express from "express";
import verifyToken from "../middlewares/verify_token";
import { isAdmin, isStaffOrAdmin } from "../middlewares/verify_role";

const router = express.Router();

// PUBLIC ENDPOINT

//PRIVATE ENDPOINT
router.use(verifyToken);

router.get("/", userController.getCurrent);
router.put("/:id", userController.updateUserById);

router.get("/users", [isAdmin], userController.getAllOfUsers);
router.delete("/:id", [isAdmin], userController.deteleUserById);

module.exports = router;
