import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getUsersForSidebar } from '../controllers/message.controller.js';
import { getMessages, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();


router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id([0-9a-fA-F]+)",protectRoute,getMessages)
router.post("/send/:id([0-9a-fA-F]+)", protectRoute, sendMessage);

export default router;