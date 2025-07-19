import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  room: String,
  socketId: String,
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", userSchema);



