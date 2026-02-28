import express from "express";
import { sql } from "../config/db.js";


const router = express.Router();


// adding with post tested in postman
router.post("/", async (req,res)=> {
    try{
        // values for database
        const{title,amount, category,user_id} = req.body;
        if(!title || !user_id || !category || amount==undefined){
            return res.status(400).json({message: "All fields are required"});
        }
        const transaction =  await sql`INSERT INTO transactions(user_id,title,amount,category) 
        VALUES(${user_id},${title},${amount},${category})
        RETURNING * `;

        res.status(201).json(transaction[0]);

    }catch(error){
        console.log(" Error creating the transaction",error);
        res.status(500).json({message:" Server problem"});
    }
   
});

// getting with get tested in postman
// userId is way to fetch the database with primary key
router.get("/:user_id" , async (req,res) => {
    try{
        const{user_id} = req.params; // getting the id for the user
        const transactions = await sql`SELECT * FROM transactions 
        WHERE user_id =${user_id}  ; `;
        res.status(200).json(transactions);
    }catch(error){
        console.log(" Error getting the transaction",error);
        res.status(500).json({message:" Server problem"});
    }

});
// deleting with delete tested in postman
router.delete("/:id", async (req, res) => {
    try{
        
        const {id} = req.params; // getting the id for the transaction
        if(isNaN(parseInt(id))){
            return res.status(400).json({messgae : " you need to enter a Number"});
        }
        const resault = await sql`DELETE FROM transactions 
        WHERE id =${id} RETURNING * ; `;
        if (resault.length == 0){
        return  res.status(404).json({message:" Transaction not found or deleted"});
        }else{
             return  res.status(200).json({message:" Transaction deleted successfully"});
        }
        
    }catch(error){
        console.log(" Error delleting  the transaction",error);
        res.status(500).json({message:" Server problem"});
    }
});

//summary with get tested in postman
router.get("/summary/:user_id" ,async(req,res) => {
    try{
        const{user_id}=req.params;
        const balance_res = await sql`SELECT COALESCE(SUM(amount),0) as balance FROM transactions WHERE user_id = ${user_id} ;`;
        const income_res = await sql`SELECT COALESCE(SUM(amount),0) as income FROM transactions WHERE user_id = ${user_id} AND amount > 0;`;
        const expenses_res = await sql`SELECT COALESCE(SUM(amount),0) as expenses FROM transactions WHERE user_id = ${user_id} AND amount < 0;`;
        res.status(200).json({
            balance: balance_res[0].balance,
            income: income_res[0].income,
            expenses: expenses_res[0].expenses,
        });
    }catch(error){
        console.log(" Error gettting the summary",error);
        res.status(500).json({message:" Server problem"});
    }
});

export default router;