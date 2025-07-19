import Room from "../models/Room.js";

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const roomExists = await Room.findOne({ name });
    if (roomExists) return res.status(400).json({ error: "Room already exists" });

    const newRoom = await Room.create({ name });
    res.json(newRoom);
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
};
