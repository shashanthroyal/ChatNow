import express from 'express'
import Message from '../models/Message.js';

const router = express.Router();

router.get("/:userId/:receiverId", async(req,res) =>{
    try {
        const { userId, receiverId } = req.params;
        const messages = await Message.find({
          $or: [
            { senderId: userId, receiverId },
            { senderId: receiverId, receiverId: userId }
          ]
        }).sort({ createdAt: 1 });
        res.json(messages);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
})

router.post("/", async (req, res) => {
    try {
        const { senderId, receiverId, text } = req.body;
        const newMessage = new Message({ senderId, receiverId, text });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;