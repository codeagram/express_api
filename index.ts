import express from "express";
const app = express();


app.get("/", (req, res) => {
    res.send("Hello From Express");
})

const PORT = 3000;
app.listen(PORT, () => console.log(`App Listens on Port ${PORT}`));