const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors()); // Engedélyezi a frontend számára az API elérést
app.use(express.json()); // JSON adatok kezelése

app.get("/api/activities", (req, res) => {
  res.json([{ id: 1, name: "Run", distance: 5000 }]);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
