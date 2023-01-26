import express from "express";
import prisma from "../prisma/prisma";
import qr from 'qrcode';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const userRouter = express.Router();


const generateQR = async (url: string, filepath: string): Promise<void> => {
    await qr.toFile(filepath, url);
};


const hashPassword = async (password: string, saltRounds: number) => {
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    } catch (err) {
        console.log(err);
    }

};


const comparePassword = async (plaintextPassword: string, hash: string): Promise<boolean> => {
    try {
        const result = await bcrypt.compare(plaintextPassword, hash);
        return result;
    } catch (err) {
        console.log(err);
        return false;
    }
};


userRouter.get("/", async (req, res) => {

    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json(
            {
                message: "Internal Server Error"
            }
        )
    }
});


userRouter.post("/", async (req, res) => {

    try {
        let { email, fullName, phoneNumber, plainPassword, latitude, longitude } = req.body;
        let qrCode: string = '';
        const saltRounds = 10;
        const password:string = await hashPassword(plainPassword, saltRounds) || '';
        const newUser = await prisma.user.create(
            {
                data: {
                    email,
                    fullName,
                    phoneNumber,
                    password,
                    latitude,
                    longitude,
                    qrCode
                }
            }
        );

        const baseUrl = `${process.env.BASE_URL}/customers/register?aid=${newUser.id}`;
        const qrUrl = `media/${newUser.id}.png`;
        generateQR(baseUrl, qrUrl);

        res.status(201).json(newUser);
    } catch (error) {
        console.log(error);
        res.status(500).json(
            {
                message: "Internal Server Error"
            }
        );
    }
})


export default userRouter;