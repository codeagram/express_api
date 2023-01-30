import express from "express";
import prisma from "../prisma/prisma";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const customerRouter = express.Router();

customerRouter.get("/", async (req, res) => {
    try {
        const customers = await prisma.customer.findMany(
            {
                include: {
                    agent: true,
                    taluk: true,
                }
            }
        );
        res.json(customers);
    } catch (error) {
        res.status(500).json(
            {
                message: "Internal Server Error"
            }
        )
    }
})


customerRouter.post("/", async (req, res) => {
    try {
        let newCustomer;
        let { fullName, phoneNumber, email, aadharNumber, pincode, agentId, address, talukName, latitude, longitude } = req.body;
        if (email === '') {
            email = null;
        }

        const taluk = await prisma.taluk.findFirst({
            where: {
                talukName: talukName,
            },
            include: {
                branch: true,
                district: true
            }
        })

        if (agentId == "0") {
            const agent = await prisma.user.findFirst({
                where: {
                    fullName: 'Direct'
                }
            })

            agentId = agent!.id
        }

        newCustomer = await prisma.customer.create({
            data: {
                fullName,
                phoneNumber,
                email,
                aadharNumber,
                pincode,
                address,
                register_latitude: latitude,
                register_longitude: longitude,
                agent: {
                    connect: {
                        id: Number(agentId),
                    }
                },
                taluk: {
                    connect: {
                        id: Number(taluk!.id),
                    }
                }
            }
        });


        if (email) {

            const mailer = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: process.env.SMTP_SECURE === 'YES' ? true : false,
                auth: {
                    user: process.env.SMTP_USERNAME,
                    pass: process.env.SMTP_PASSWORD,
                }
            });

            const mailOptions = {
                from: process.env.SMTP_USERNAME,
                to: email,
                subject: 'New Customer',
                text: `Customer Registration Successfull!\n\nEntered Details:\nFull Name: ${fullName}\nPhone Number: ${phoneNumber}\nAadhar Number: ${aadharNumber}\nEmail: ${email}\nDistrict: ${taluk!.district?.districtName}\nBranch: ${taluk!.branch?.branchCode}\nTaluk: ${taluk}\nLatitude: ${latitude}\nLongitude: ${longitude}`
            };

            mailer.sendMail(mailOptions);
        }
        res.status(201).json({
            status: 'success',
            data: newCustomer
        });

    } catch (error: any) {
        console.log(error);
        if (error.code === 'P2002') {
            let message = '';
            if (error.meta.target[0] === 'phoneNumber') {
                message = 'Phone Number already exists'
            } else if (error.meta.target[0] === 'aadharNumber') {
                message = 'Aadhar Number already exists'
            } else if (error.meta.target[0] === 'email') {
                message = 'Email already exists'
            }

            res.status(422).json({
                status: 'failiure',
                message: message
            })
        }
    }
})


export default customerRouter;