import express from "express";
import prisma from "../prisma/prisma";
import nodemailer from 'nodemailer';

const customerRouter = express.Router();

customerRouter.get("/", async (req, res) => {
    try {
        const customers = await prisma.customer.findMany(
            {
                include: {
                    agent: true,
                    branch: true,
                    taluk: true,
                    district: true
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
        let { fullName, phoneNumber, email, aadharNumber, pincode, agentId, address, talukName } = req.body;
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

        const newCustomer = await prisma.customer.create({
            data: {
                fullName,
                phoneNumber,
                email,
                aadharNumber,
                pincode,
                address,
                agent: {
                    connect: {
                        id: Number(agentId),
                    }
                },
                taluk: {
                    connect: {
                        id: Number(taluk!.id),
                    }
                },
                district: {
                    connect: {
                        id: Number(taluk!.district.id),
                    }
                },
                branch: {
                    connect: {
                        id: Number(taluk!.branch.id),
                    }
                }
            }
        });

        console.log(newCustomer);

        if (email) {

            const mailer = nodemailer.createTransport({
                host: 'smtp.hostinger.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'careers@surabhi.group',
                    pass: '?ajiTU#b7H',
                }
            });

            const mailOptions = {
                from: 'careers@surabhi.group',
                to: email,
                subject: 'New Customer',
                text: 'Customer Registration Successfull!'
            };

            const info = await mailer.sendMail(mailOptions);
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