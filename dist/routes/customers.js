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
        const { fullName, phoneNumber, email, pincode, agentId, address, talukId, districtId } = req.body;
        const taluk = yield prisma_1.default.taluk.findUnique({
            where: {
                id: talukId,
            },
            include: {
                branch: true
            }
        });
        const newCustomer = yield prisma_1.default.customer.create({
            data: {
                fullName,
                phoneNumber,
                email,
                pincode,
                address,
                agent: {
                    connect: {
                        id: agentId,
                    }
                },
                taluk: {
                    connect: {
                        id: talukId,
                    }
                },
                district: {
                    connect: {
                        id: districtId,
                    }
                },
                branch: {
                    connect: {
                        id: taluk.branch.id,
                    }
                }
            }
        });
        res.json(newCustomer);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}));
exports.default = customerRouter;
