import express from "express";
import { getRooms, createRoom } from "../controllers/roomController.js";

const router = express.Router();

// Get all rooms
router.get("/", getRooms);

// Add a new room
router.post("/", createRoom);

export default router;

