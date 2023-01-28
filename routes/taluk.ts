import express from "express";
import prisma from "../prisma/prisma";
import * as queryString from "query-string";
import ParsedQs from 'query-string';

const talukRouter = express.Router();

talukRouter.get("/", async (req, res) => {

    if (req.query.district) {
        try {
            const districtName: string = req.query.district as string;
            const district = await prisma.district.findUnique({
                where: {
                    districtName: districtName,
                }
            });

            console.log(district);

            const taluks = await prisma.taluk.findMany({
                where: {
                    districtId: district?.id
                }
            })

            res.json(taluks);
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
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
    }
});



export default talukRouter;