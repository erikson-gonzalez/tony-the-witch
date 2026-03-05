import express from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/api/inquiries", async (req, res) => {
  res.status(201).json({ message: "Inquiry received" });
});

export default app;
