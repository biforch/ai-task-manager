import { useState } from "react";

import TaskCard from "./TaskCard";

function CompletedTasksSection({ tasks, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="completed-tasks-section">
      <button
        type="button"
        className="completed-tasks-toggle"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
      >
        已完成（{tasks.length}）
        <span className="completed-tasks-toggle-icon">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="task-list completed-task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
              compact
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default CompletedTasksSection;
