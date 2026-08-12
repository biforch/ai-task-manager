const db = require("./db");


db.run(
  `
  INSERT INTO tasks
  (title, description, status)
  VALUES (?, ?, ?)
  `,
  [
    "Learn AI Coding Workflow",
    "Build AI development environment",
    "todo"
  ],
  function(err){

    if(err){
      console.error(err);
      return;
    }

    console.log("Task inserted:", this.lastID);

  }
);


db.close();