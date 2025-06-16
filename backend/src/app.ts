import express from "express";
import helmet from "helmet";
import cors from "cors";
import clarifyRoutes from "./routes/clarify";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/clarify", clarifyRoutes);

// TODO: Import and use routes here
// import clarifyRoutes from './routes/clarify';
// app.use('/api/clarify', clarifyRoutes);

export default app;
