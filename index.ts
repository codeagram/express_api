import express from "express";
import cors from "cors";
import compression from "compression";

const app = express();
app.use(express.json())
app.use(cors());
app.use(compression());

import customerRouter from './routes/customer';
import districtRouter from './routes/district';
import userRouter from './routes/user';
import talukRouter from './routes/taluk';
import dataRouter from './routes/data';

app.use("/api/customers", customerRouter);
app.use("/api/districts", districtRouter);
app.use("/api/users", userRouter);
app.use("/api/taluk", talukRouter);
app.use("/api/data", dataRouter);


const PORT = 3000;
app.listen(PORT, () => console.log(`App Listens on Port ${PORT}`));
