import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    senderId: { 
      type: Number, 
      required: true 
    },
    chatId: { 
      type: Number, 
      required: true,
      ref: 'Chat' // Reference to Chat model if you're using Mongoose
    },
    text: { 
      type: String, 
      required: true 
    },
    timestamp: { 
      type: Date, 
      default: Date.now // Automatically set to current time when created
    }
  });

  messageSchema.index({ chatId: 1, timestamp: 1 });

  export default mongoose.model('Message', messageSchema, 'messages');