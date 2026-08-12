const {
    generateAIResponse
} = require("../ai/aiService");


const db = require("../database/db");



const generateTasks = (req,res)=>{


    const {
        goal
    } = req.body;



    if(!goal){

        return res.status(400).json({
            error:"Goal is required"
        });

    }



    const tasks =
        generateAIResponse(goal);



    const insertTasks = tasks.map(task=>{


        return new Promise((resolve,reject)=>{


            db.run(
                `
                INSERT INTO tasks
                (
                title,
                description,
                status
                )
                VALUES
                (?,?,?)
                `,
                [
                    task.title,
                    task.description,
                    task.status
                ],


                function(err){


                    if(err){

                        reject(err);

                    }
                    else{

                        resolve({
                            id:this.lastID,
                            ...task
                        });

                    }


                }

            );


        });


    });



    Promise.all(insertTasks)

    .then(result=>{


        res.json({

            message:"AI tasks generated",

            tasks:result

        });


    })

    .catch(err=>{


        res.status(500).json({

            error:err.message

        });


    });



};



module.exports={
    generateTasks
};