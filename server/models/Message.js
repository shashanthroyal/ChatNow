import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {type: mongoose.Schema.Types.ObjectId, ref: "User", index: true},
    receiverId: {type: mongoose.Schema.Types.ObjectId, ref:"User", index: true},
    text: {type: String, required: true}
},{
    timestamps: true
});

messageSchema.index({ createdAt: 1 });

const Message = mongoose.model("Message", messageSchema)

export default Message;