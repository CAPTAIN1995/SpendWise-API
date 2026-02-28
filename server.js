import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { sql } from "./config/db.js";
import rateLimiter from "./midleware/rateLimiting.js";
import transactionsRoute from "./routes/transactionRoute.js";

const app = express();
// midlleware checking for spam
app.use(rateLimiter);
app.use(express.json());
// / = /api/transactions in all files with transactionsRoute
app.use("/api/transactions",transactionsRoute);


const PORT = process.env.PORT || 5001;
// initDB tested in postman
async function initDB() {
    try{
        await sql`CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY ,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        create_date DATE NOT NULL DEFAULT CURRENT_DATE
        )`;
    }catch(error){
        console.log("error inside the database",error);
        process.exit(1) // 1 mean failure and 0 success
    }
    
}

//working in port 5001
initDB().then(() => {
     app.listen(PORT, ()=> {
         console.log("Server is up port :", PORT);
     });
         });