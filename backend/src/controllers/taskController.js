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


const updateTask = (req, res) => {
  const { id } = req.params;

  const {
    title,
    description,
    status
  } = req.body;


  const sql = `
    UPDATE tasks
    SET 
      title = ?,
      description = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;


  db.run(
    sql,
    [
      title,
      description,
      status,
      id
    ],
    function(err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }


      if (this.changes === 0) {
        return res.status(404).json({
          error: "Task not found"
        });
      }


      res.json({
        id,
        title,
        description,
        status
      });

    }
  );
};


module.exports = {
  getTasks,
  createTask,
  updateTask
};