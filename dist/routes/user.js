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
const qrcode_1 = __importDefault(require("qrcode"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const userRouter = express_1.default.Router();
const generateQR = (url, filepath) => __awaiter(void 0, void 0, void 0, function* () {
    yield qrcode_1.default.toFile(filepath, url);
});
const hashPassword = (password, saltRounds) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hash = yield bcryptjs_1.default.hash(password, saltRounds);
        return hash;
    }
    catch (err) {
        console.log(err);
    }
});
const comparePassword = (plaintextPassword, hash) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield bcryptjs_1.default.compare(plaintextPassword, hash);
        return result;
    }
    catch (err) {
        console.log(err);
        return false;
    }
});
userRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}));
userRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, fullName, phoneNumber, plainPassword, latitude, longitude } = req.body;
        const saltRounds = 10;
        const password = (yield hashPassword(plainPassword, saltRounds)) || '';
        const newUser = yield prisma_1.default.user.create({
            data: {
                email,
                fullName,
                phoneNumber,
                password,
                latitude,
                longitude
            }
        });
        const baseUrl = `${process.env.BASE_URL}/customers/register?aid=${newUser.id}`;
        const qrUrl = `media/${newUser.id}.png`;
        generateQR(baseUrl, qrUrl);
        res.status(201).json(newUser);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}));
exports.default = userRouter;
