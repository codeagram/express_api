import express from "express";
import util from 'util';
import prisma from "../prisma/prisma";
import * as qrcode from 'qrcode';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import * as cloudinary from 'cloudinary'
import streamifier from 'streamifier';


dotenv.config();


cloudinary.v2.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    }
);

const userRouter = express.Router();


const generateQR = async (data: string): Promise<Buffer> => {
    return await qrcode.toBuffer(data);
}

const streamUpload = async (buffer: Buffer, folder: string, publicId: string) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.v2.uploader.upload_stream(
            { folder: folder, public_id: publicId },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result?.secure_url);
                }
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
}

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

        const saltRounds = 10;
        const password: string = await hashPassword(plainPassword, saltRounds) || '';
        const newUser = await prisma.user.create(
            {
                data: {
                    email,
                    fullName,
                    phoneNumber,
                    password,
                    latitude,
                    longitude,
                }
            }
        );
        const baseUrl = `${process.env.BASE_URL}/customers/register?aid=${newUser.id}`;
        const q = await generateQR(baseUrl);
        const secure_url: any = await streamUpload(q, "QR-Code", `${newUser.id}-${newUser.email}`);

        const user = await prisma.user.update({
            where: {
                id: newUser.id
            },
            data: {
                qrCode: secure_url
            }
        })

        res.status(201).json(user);
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