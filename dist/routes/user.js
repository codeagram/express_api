"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const qrcode = __importStar(require("qrcode"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinary = __importStar(require("cloudinary"));
const streamifier_1 = __importDefault(require("streamifier"));
dotenv_1.default.config();
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
const userRouter = express_1.default.Router();
const generateQR = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield qrcode.toBuffer(data);
});
const streamUpload = (buffer, folder, publicId) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.v2.uploader.upload_stream({ folder: folder, public_id: publicId }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result === null || result === void 0 ? void 0 : result.secure_url);
            }
        });
        streamifier_1.default.createReadStream(buffer).pipe(stream);
    });
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
                longitude,
            }
        });
        const baseUrl = `${process.env.BASE_URL}/customers/register?aid=${newUser.id}`;
        const q = yield generateQR(baseUrl);
        const secure_url = yield streamUpload(q, "QR-Code", `${newUser.id}-${newUser.email}`);
        const user = yield prisma_1.default.user.update({
            where: {
                id: newUser.id
            },
            data: {
                qrCode: secure_url
            }
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}));
exports.default = userRouter;
