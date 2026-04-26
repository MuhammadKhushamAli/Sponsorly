import {signupUser, loginUser, logoutUser, refreshAccessToken} from "../controllers/auth.controller.js";
import {verifytoken} from "../middlewares/auth.middleware.js";
import express from 'express'
const router = express.Router();

router.post("/signup", signupUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/login", loginUser);
router.post("/logout", verifytoken, logoutUser);

export default router;