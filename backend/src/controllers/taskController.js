const db = require("../database/db");


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
          error: err.message
        });
      }


      res.status(201).json({
        id: this.lastID,
        title,
        description,
        status: status || "todo"
      });

    }
  );

};


module.exports = {
  getTasks,
  createTask
};