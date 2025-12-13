import express from "express";
import Watchlist from "../models/Watchlist.js";

const router = express.Router();

// GET watchlist for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const watchlist = await Watchlist.findOne({ userId });

    if (!watchlist) {
      return res.json({ userId, coins: [] });
    }

    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

// SAVE / UPDATE watchlist
router.post("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { coins } = req.body;

    const watchlist = await Watchlist.findOneAndUpdate(
      { userId },
      { coins },
      { new: true, upsert: true }
    );

    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to update watchlist" });
  }
});

export default router;
