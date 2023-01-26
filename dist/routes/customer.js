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
const customerRouter = express_1.default.Router();
customerRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customers = yield prisma_1.default.customer.findMany({
            include: {
                agent: true,
                branch: true,
                taluk: true,
                district: true
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
    try {
        let { fullName, phoneNumber, email, aadharNumber, pincode, agentId, address, talukName } = req.body;
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
        const newCustomer = yield prisma_1.default.customer.create({
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
                        id: Number(taluk.id),
                    }
                },
                district: {
                    connect: {
                        id: Number(taluk.district.id),
                    }
                },
                branch: {
                    connect: {
                        id: Number(taluk.branch.id),
                    }
                }
            }
        });
        console.log(newCustomer);
        if (email) {
            const mailer = nodemailer_1.default.createTransport({
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
            const info = yield mailer.sendMail(mailOptions);
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
