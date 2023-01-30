"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../prisma/prisma"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const customerRouter = express_1.default.Router();
customerRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customers = yield prisma_1.default.customer.findMany({
            include: {
                agent: true,
                taluk: true,
            }
        });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}));
customerRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let newCustomer;
        let { fullName, phoneNumber, email, aadharNumber, pincode, agentId, address, talukName, latitude, longitude } = req.body;
        if (email === '') {
            email = null;
        }
        const taluk = yield prisma_1.default.taluk.findFirst({
            where: {
                talukName: talukName,
            },
            include: {
                branch: true,
                district: true
            }
        });
        if (agentId == "0") {
            const agent = yield prisma_1.default.user.findFirst({
                where: {
                    fullName: 'Direct'
                }
            });
            agentId = agent.id;
        }
        newCustomer = yield prisma_1.default.customer.create({
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
                        id: parseInt(agentId),
                    }
                },
                taluk: {
                    connect: {
                        id: taluk.id,
                    }
                }
            }
        });
        const agent = yield prisma_1.default.user.findFirst({
            where: {
                id: agentId
            }
        });
        if (email) {
            const mailer = nodemailer_1.default.createTransport({
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
                text: `Customer Registration Successfull!\n\nEntered Details:\nFull Name: ${fullName}\nPhone Number: ${phoneNumber}\nAadhar Number: ${aadharNumber}\nEmail: ${email}\nAddress: ${address}\nDistrict: ${(_a = taluk.district) === null || _a === void 0 ? void 0 : _a.districtName}\nBranch: ${(_b = taluk.branch) === null || _b === void 0 ? void 0 : _b.branchCode}\nTaluk: ${taluk}\nPincode: ${pincode}\nAgent: ${agent === null || agent === void 0 ? void 0 : agent.fullName}\nLatitude: ${latitude}\nLongitude: ${longitude}`
            };
            mailer.sendMail(mailOptions);
        }
        res.status(201).json({
            status: 'success',
            data: newCustomer
        });
    }
    catch (error) {
        console.log(error);
        if (error.code === 'P2002') {
            let message = '';
            if (error.meta.target[0] === 'phoneNumber') {
                message = 'Phone Number already exists';
            }
            else if (error.meta.target[0] === 'aadharNumber') {
                message = 'Aadhar Number already exists';
            }
            else if (error.meta.target[0] === 'email') {
                message = 'Email already exists';
            }
            res.status(422).json({
                status: 'failiure',
                message: message
            });
        }
    }
}));
exports.default = customerRouter;
