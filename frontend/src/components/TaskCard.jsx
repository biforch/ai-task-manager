function TaskCard({ task }) {
    return (
      <div className="task-card">
        <h3>{task.title}</h3>
  
        <p>{task.description}</p>
  
        <div className="task-status">
          Status: {task.status}
        </div>
      </div>
    );
  }
  
  export default TaskCard;