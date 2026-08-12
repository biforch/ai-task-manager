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


module.exports = {
  getTasks
};