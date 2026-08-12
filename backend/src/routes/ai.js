const express=require("express");

const router=express.Router();

const {
    generateTasks
}=require("../controllers/aiController");


router.post(
    "/generate",
    generateTasks
);


module.exports=router;