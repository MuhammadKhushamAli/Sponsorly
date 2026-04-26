import {signupUser} from "../controllers/auth.controller.js";
import express from 'express'
const router = express.Router();

router.post("/signupUser", signupUser);

export default router;
