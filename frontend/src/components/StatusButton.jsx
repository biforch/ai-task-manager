function StatusButton({ task, onUpdate }) {

    const nextStatus =
      task.status === "todo"
        ? "done"
        : "todo";
  
  
    const handleClick = () => {
  
      onUpdate(task.id, {
        status: nextStatus
      });
  
    };
  
  
    return (
      <button onClick={handleClick}>
        {task.status === "todo"
          ? "Mark Done"
          : "Mark Todo"}
      </button>
    );
  }
  
  
  export default StatusButton;