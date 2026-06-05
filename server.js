const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
console.log("MY FAMILY APP STARTING...");
const app = express();
const authRoutes = require("./routes/auth");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      req.user = jwt.verify(token, "myfamilysecret");
    } catch (err) {
      console.log("Invalid token");
    }
  }

  next();
});
app.use("/auth", authRoutes);
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));
app.get("/", (req, res) => {
res.send(`

  <!DOCTYPE html>    <html>  
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
      }  .box{  
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
});  const PORT = process.env.PORT || 3000;
app.get("/register", (req, res) => {
res.sendFile(__dirname + "/views/register.html");
});
app.get("/login", (req, res) => {
res.sendFile(__dirname + "/views/login.html");
});
const User = require("./models/User.js");
const Post = require("./models/Post.js");
const Comment = require("./models/Comment.js");
const Reply = require("./models/Reply.js");
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
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log("USERNAME:", req.params.username);
console.log("USER:", user);

    if (!user) {
      return res.send("User not found");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.send("Incorrect password");
    }

const token = jwt.sign(
  {
    userId: user._id,
    username: user.username
  },
  "myfamilysecret"
);

res.cookie("token", token);

console.log("Logged in:", user.username);

res.send(`
<h2>Login Successful</h2>

<p>Welcome ${user.username}</p>

<p>Token:</p>

<textarea rows="8" cols="50">${token}</textarea>

<br><br>

<a href="/family">Go To Family</a>
`);

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.send(err.message);
  }
});
  
app.post("/post", async (req, res) => {
try {
const { username, content } = req.body;

const post = new Post({  
  username,  
  content  
});  

await post.save();  

res.redirect("/family");

} catch (err) {
console.log(err);
res.send(err.message);
}
});
app.post("/like/:id", async (req, res) => {
try {
await Post.findByIdAndUpdate(
req.params.id,
{ $inc: { likes: 1 } }
);

res.redirect("/family");

} catch (err) {
console.log(err);
res.send(err.message);
}
});
app.post("/comment/:id", async (req, res) => {
try {
const { username, content } = req.body;

const comment = new Comment({  
  postId: req.params.id,  
  username,  
  content  
}); 
  
    await comment.save();

    res.redirect("/family");
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});
app.post("/reply/:id", async (req, res) => {
  try {
    const { username, content } = req.body;

    const reply = new Reply({
      commentId: req.params.id,
      username,
      content
    });

    await reply.save();

    res.redirect("/family");
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

app.get("/family", async (req, res) => {

  if (!req.user) {
    return res.redirect("/login");
  }

const posts = await Post.find().sort({ createdAt: -1 });
const comments = await Comment.find();
const replies = await Reply.find();

  
let postHtml = "";

posts.forEach(post => {

let commentHtml = "";

comments.forEach(comment => {
  let replyHtml = "";

replies.forEach(reply => {
  if (reply.commentId === comment._id.toString()) {
    replyHtml += `
      <div style="
        margin-left:40px;
        padding:8px;
        margin-top:5px;
        background:#475569;
        border-radius:8px;
      ">
        <strong>
  <a
    href="/profile/${reply.username}"
    style="
      color:#60a5fa;
      text-decoration:none;
    "
  >
    👤 ${reply.username}
  </a>
</strong>
        <p>${reply.content}</p>
      </div>
    `;
  }
});
   
  if (comment.postId === post._id.toString()) {
    commentHtml += `
  <div style="
    margin-left:20px;
    margin-top:10px;
    padding:10px;
    background:#334155;
    border-radius:8px;
  ">
    <strong>
  <a
    href="/profile/${comment.username}"
    style="
      color:#60a5fa;
      text-decoration:none;
    "
  >
    👤 ${comment.username}
  </a>
</strong>
    <p>${comment.content}</p>

    <form method="POST" action="/reply/${comment._id}">
      <input
  type="text"
  name="username"
  value="${req.user ? req.user.username : ''}"
  readonly
>

      <br><br>

      <input
        type="text"
        name="content"
        placeholder="Write a reply..."
        required
      >

      <br><br>

      <button type="submit">
        ↩️ Reply
      </button>
    </form>
${replyHtml}
  </div>
`;
  }
});
postHtml += `
<div style="  
background:#1e293b;  
padding:15px;  
margin:10px;  
border-radius:10px;  
">
<h3>
  <a
    href="/profile/${post.username}"
    style="
      color:#60a5fa;
      text-decoration:none;
    "
  >
    👤 ${post.username}
  </a>
  <br><br>

</h3>

<p>${post.content}</p>  <p>❤️ ${post.likes || 0} Likes</p>  <form method="POST" action="/like/${post._id}">  
  <button type="submit">  
    ❤️ Like  
  </button>  
</form>  
<form method="POST" action="/comment/${post._id}">  
  <input  
    type="text"  
    name="username"  
    value="${req.user ? req.user.username : ''}"
    readonly
  >  <br><br>

<input
type="text"
name="content"
placeholder="Write a comment..."
required
>
<br><br>

  <button type="submit">  
    💬 Comment  
  </button>  
</form>  <h4>💬 Comments</h4>  
${commentHtml}  
      </div>  
    `;  
  });  res.send(`
<html>
<head>
<title>MY FAMILY</title>
<style>
body{
font-family:Arial;
background:#0f172a;
color:white;
max-width:700px;
margin:auto;
padding:20px;
}

textarea{  
      width:100%;  
      height:100px;  
      border-radius:8px;  
    }  

    button{  
      margin-top:10px;  
      padding:10px 20px;  
      background:#22c55e;  
      color:white;  
      border:none;  
      border-radius:8px;  
    }  
  </style>  
</head>  
<body>  

  <h1>MY FAMILY ❤️</h1>

<a
  href="/logout"
  style="
    color:white;
    background:#ef4444;
    padding:8px 12px;
    border-radius:8px;
    text-decoration:none;
    display:inline-block;
    margin-bottom:20px;
  "
>
  Logout
</a>  

  <input
  type="text"
  name="username"
  value="${req.user ? req.user.username : ''}"
  readonly
>

    <br><br>  

    <textarea  
      name="content"  
      placeholder="What's on your mind?"  
      required  
    ></textarea>  

    <br>  

    <button>Create Post</button>  
  </form>  

  <hr>  

  ${postHtml}  

</body>  
</html>

`);
});

app.get("/profile/:username", async (req, res) => {

  if (!req.user) {
    return res.redirect("/login");
  }
  try {
    const username = decodeURIComponent(req.params.username);

    const user = await User.findOne({ username });

    if (!user) {
      return res.send("User not found");
    }

    const userPosts = await Post.find({ username })
      .sort({ createdAt: -1 });

    let postsHtml = "";

    userPosts.forEach(post => {
      postsHtml += `
        <div style="
          background:#1e293b;
          padding:15px;
          margin:10px 0;
          border-radius:10px;
        ">
          <p>${post.content}</p>
          <small>❤️ ${post.likes || 0} Likes</small>
        </div>
      `;
    });

    res.send(`
      <html>
      <body style="
        font-family:Arial;
        background:#0f172a;
        color:white;
        max-width:700px;
        margin:auto;
        padding:20px;
      ">

        <h1>${user.avatar} ${user.username}</h1>
        <p>${user.bio || "No bio yet"}</p><p>Total Posts: ${userPosts.length}</p><a href="/edit-profile/${encodeURIComponent(user.username)}">
  Edit Profile
</a><br><br>

<a href="/family">
  Back To Family
</a><hr>${postsHtml}

</body>
</html>
`);} catch (err) {
console.log(err);
res.send(err.message);
}
});

        
app.post("/edit-profile/:username", async (req, res) => {
  try {

    const { username, avatar, bio } = req.body;
const oldUsername = req.params.username;
    await User.findOneAndUpdate(
  { username: req.params.username },
  {
    username,
    avatar,
    bio
  }
);
    await Post.updateMany(
  { username: oldUsername },
  { username }
);

await Comment.updateMany(
  { username: oldUsername },
  { username }
);

await Reply.updateMany(
  { username: oldUsername },
  { username }
);
    res.redirect(`/profile/${username}`);

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

app.get("/edit-profile/:username", async (req, res) => {

  if (!req.user) {
    return res.redirect("/login");
  }
  try {
if (req.user.username !== req.params.username) {
  return res.send("Access denied");
}
    const user = await User.findOne({
      username: req.params.username
    });

    if (!user) {
      return res.send("User not found");
    }

    res.send(`
      <html>
      <body>

        <h1>Edit Profile</h1>

<form method="POST" action="/edit-profile/${user.username}">

  <p>Username</p>

  <input
    type="text"
    name="username"
    value="${user.username}"
  >

  <br><br>

          <input
            type="text"
            name="avatar"
            value="${user.avatar}"
          >

          <br><br>

          <textarea
            name="bio"
            rows="5"
          >${user.bio}</textarea>

          <br><br>

          <button type="submit">
            Save Profile
          </button>

        </form>

      </body>
      </html>
    `);

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});
app.get("/users", async (req, res) => {
  const users = await User.find();

  res.send(users);
});
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});
app.get("/posts", async (req, res) => {
  const posts = await Post.find();
  res.send(posts);
});
app.get("/fix-lucky", async (req, res) => {

  await Post.updateMany(
    { username: "Lucky" },
    { username: "King David " }
  );

  await Post.updateMany(
    { username: "Lucky " },
    { username: "King David " }
  );

  await Comment.updateMany(
    { username: "Lucky" },
    { username: "King David " }
  );

  await Comment.updateMany(
    { username: "Lucky " },
    { username: "King David " }
  );

  await Reply.updateMany(
    { username: "Lucky" },
    { username: "King David " }
  );

  await Reply.updateMany(
    { username: "Lucky " },
    { username: "King David " }
  );

  res.send("Fixed");
});
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
