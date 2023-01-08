import express from "express";
import prisma from "./prisma/prisma";

const app = express();
app.use(express.json())

app.get("/api/users", async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json(error);
    }
})

app.post("/api/users", async (req, res) => {
    try {
        const { email, fullName, phoneNumber, password, latitude, longitude } = req.body

        const newUser = await prisma.user.create({
            data: {
                email,
                fullName,
                phoneNumber,
                password,
                latitude,
                longitude
            }
        })
        res.json(newUser);
    } catch (error: any) {
        res.status(500).json(error);
    }
})

const PORT = 3000;
app.listen(PORT, () => console.log(`App Listens on Port ${PORT}`));