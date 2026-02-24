import { Router } from "express";
import { addToHistory, getUserHistory, login, register,getProfile } from "../controllers/userController.js";

const router=Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/getProfile").get(getProfile);

export default router;