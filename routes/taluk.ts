import express from "express";
import prisma from "../prisma/prisma";

const talukRouter = express.Router();

talukRouter.get("/", async (req, res) => {

    try {
        const taluks = await prisma.taluk.findMany();
        res.json(taluks);
    } catch (error) {
        res.status(500).json(
            {
                message: "Internal Server Error"
            }
        )
    }
});


export default talukRouter;