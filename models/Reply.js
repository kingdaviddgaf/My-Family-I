const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
  commentId: {
    type: String,
    required: true
  },

  username: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Reply", ReplySchema);
