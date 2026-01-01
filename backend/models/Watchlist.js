import mongoose from "mongoose";
const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    coins: {
      type: [String], // e.g. ["bitcoin", "ethereum"]
      default: [],
    },
  },
  { timestamps: true }
);
export default mongoose.model("Watchlist", watchlistSchema);
