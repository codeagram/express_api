import express from "express";
import prisma from "../prisma/prisma";

const districtRouter = express.Router();

districtRouter.get("/", async (req, res) => {
    try {
        const districts = await prisma.district.findMany();
        res.json(districts);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
})

export default districtRouter;