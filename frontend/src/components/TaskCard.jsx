import StatusButton from "./StatusButton";


function TaskCard({ task, onUpdate }) {

  return (
    <div className="task-card">

      <h2>
        {task.title}
      </h2>

      <p>
        {task.description}
      </p>

      <p>
        Status: {task.status}
      </p>


      <StatusButton
        task={task}
        onUpdate={onUpdate}
      />

    </div>
  );
}


export default TaskCard;