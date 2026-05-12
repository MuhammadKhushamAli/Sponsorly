import {signupUser, loginUser, logoutUser, refreshAccessToken} from "../controllers/auth.controller.js";
import {verifyToken} from "../middlewares/verifytoken.js"
import express from 'express'
const router = express.Router();

router.post("/signup", signupUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);

export default router;