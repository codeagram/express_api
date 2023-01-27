import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json())
app.use(cors());
app.use(compression());

import customerRouter from './routes/customer';
import districtRouter from './routes/district';
import userRouter from './routes/user';
import talukRouter from './routes/taluk';

app.use("/api/customers", customerRouter);
app.use("/api/districts", districtRouter);
app.use("/api/users", userRouter);
app.use("/api/taluks", talukRouter);


const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`App Listens on Port ${PORT}`));
