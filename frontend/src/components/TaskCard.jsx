import TaskStatusControl from "./TaskStatusControl";

function TaskCard({ task, onUpdate, onDelete, compact }) {
  const handleDelete = () => {
    if (!onDelete) {
      return;
    }

    const confirmed = window.confirm(
      `确定删除任务「${task.title}」吗？此操作无法撤销。`
    );

    if (confirmed) {
      onDelete(task.id);
    }
  };

  return (
    <article className={`task-card${compact ? " task-card-compact" : ""}`}>
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        {onDelete && (
          <button
            type="button"
            className="button-secondary task-delete-button"
            onClick={handleDelete}
          >
            删除
          </button>
        )}
      </div>

      {task.description && <p className="task-card-description">{task.description}</p>}

      <TaskStatusControl task={task} onUpdate={onUpdate} />
    </article>
  );
}

export default TaskCard;
