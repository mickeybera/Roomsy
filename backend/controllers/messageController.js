import Message from "../models/Message.js";
import PrivateMessage from "../models/PrivateMessage.js";

export const getMessages = async (req, res) => {
  try {
    const { room } = req.query;
    const messages = await Message.find({ room }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//private messages
export const getPrivateMessages = async (req, res) => {
  try {
    const { sender, recipient } = req.params;
    const messages = await PrivateMessage.find({
      $or: [
        { sender, recipient },
        { sender: recipient, recipient: sender }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
