const getTasks = (req, res) => {
    const tasks = [
      {
        id: 1,
        title: "Learn AI Coding Workflow",
        description: "Build AI development environment",
        status: "todo"
      }
    ];
  
    res.json(tasks);
  };
  
  module.exports = {
    getTasks
  };