const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = express();
const authRoutes = require("./routes/auth");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/auth", authRoutes);
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>MY FAMILY</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body{
        font-family:Arial,sans-serif;
        background:#0f172a;
        color:white;
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
        margin:0;
        text-align:center;
      }

      .box{
        padding:30px;
      }

      h1{
        font-size:3rem;
      }

      p{
        opacity:0.8;
      }

      button{
        padding:12px 25px;
        border:none;
        border-radius:8px;
        background:#22c55e;
        color:white;
        font-size:16px;
        cursor:pointer;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <h1>MY FAMILY</h1>
      <p>Welcome to our family chat room.</p>
      <button>Coming Soon</button>
    </div>
  </body>
  </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/views/register.html");
});
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
});
const User = require("./models/User");

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

const user = new User({
  username,
  email,
  password: hashedPassword
});

    await user.save();

    res.send("Account created successfully!");
  } catch (err) {
  console.log("REGISTER ERROR:", err);
  res.send(err.message);
  }
});
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
