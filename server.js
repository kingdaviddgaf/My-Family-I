const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send(`
    <h1>MY FAMILY</h1>
    <p>Chat app is coming soon.</p>
  `);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
