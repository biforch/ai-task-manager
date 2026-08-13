const STATUS_OPTIONS = [
  { value: "todo", label: "待完成" },
  { value: "doing", label: "进行中" },
  { value: "done", label: "已完成" }
];

function TaskStatusControl({ task, onUpdate, disabled }) {
  const handleChange = (event) => {
    const nextStatus = event.target.value;

    if (nextStatus !== task.status) {
      onUpdate(task.id, { status: nextStatus });
    }
  };

  return (
    <label className="task-status-control">
      <span className="task-status-label">状态</span>
      <select
        value={task.status}
        onChange={handleChange}
        disabled={disabled}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default TaskStatusControl;
