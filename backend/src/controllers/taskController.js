const db = require("../database/db");


// GET ALL TASKS
const getTasks = (req, res) => {

  db.all(
    "SELECT * FROM tasks",
    [],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json(rows);

    }
  );

};



// CREATE TASK
const createTask = (req, res) => {

  const {
    title,
    description,
    status
  } = req.body;


  db.run(
    `
    INSERT INTO tasks
    (title, description, status)
    VALUES (?, ?, ?)
    `,
    [
      title,
      description,
      status || "todo"
    ],
    function(err){

      if(err){
        return res.status(500).json({
          error:err.message
        });
      }


      res.status(201).json({

        id:this.lastID,
        title,
        description,
        status:status || "todo"

      });


    }
  );

};




// UPDATE TASK STATUS
const updateTask = (req,res)=>{

  const {id}=req.params;

  const {
    status
  }=req.body;



  db.run(
    `
    UPDATE tasks

    SET
      status=?,
      updated_at=CURRENT_TIMESTAMP

    WHERE id=?
    `,
    [
      status,
      id
    ],

    function(err){

      if(err){

        return res.status(500).json({
          error:err.message
        });

      }



      if(this.changes===0){

        return res.status(404).json({
          error:"Task not found"
        });

      }



      db.get(
        "SELECT * FROM tasks WHERE id=?",
        [id],

        (err,row)=>{


          if(err){

            return res.status(500).json({
              error:err.message
            });

          }


          res.json(row);


        }
      );


    }

  );


};




// DELETE TASK
const deleteTask = (req,res)=>{


  const {id}=req.params;


  db.run(
    `
    DELETE FROM tasks
    WHERE id=?
    `,
    [id],


    function(err){


      if(err){

        return res.status(500).json({
          error:err.message
        });

      }


      if(this.changes===0){

        return res.status(404).json({
          error:"Task not found"
        });

      }



      res.json({
        message:"Task deleted"
      });


    }
  );


};




module.exports={
  getTasks,
  createTask,
  updateTask,
  deleteTask
};