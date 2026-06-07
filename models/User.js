const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  }
  ,
bio: {
  type: String,
  default: ""
},

avatar: {
  type: String,
  default: "👤"
},

  lastUsernameChange: {
  type: Date,
  default: null
},

followers: {
  type: [String],
  default: []
},

following: {
  type: [String],
  default: []
}

}, {
  timestamps: true
});

module.exports = mongoose.model("User", UserSchema);

