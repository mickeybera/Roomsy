import mongoose from "mongoose";

const PrivateMessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("PrivateMessage", PrivateMessageSchema);

