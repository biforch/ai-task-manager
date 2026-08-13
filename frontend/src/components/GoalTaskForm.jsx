import { useState } from "react";

import { createTask } from "../api/tasks";

function GoalTaskForm({ goalId, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createTask({
        title: title.trim(),
        description: description.trim(),
        status: "todo",
        goal_id: goalId
      });

      setTitle("");
      setDescription("");

      if (onCreated) {
        onCreated();
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.error || "Failed to create task";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form goal-task-form" onSubmit={handleSubmit}>
      <h3 className="subsection-title">新增任务</h3>

      <input
        placeholder="任务标题"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={submitting}
      />

      <input
        placeholder="任务描述（可选）"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        disabled={submitting}
      />

      <button type="submit" disabled={submitting || !title.trim()}>
        {submitting ? "添加中..." : "添加到当前目标"}
      </button>

      {error && <p className="error-message">{error}</p>}
    </form>
  );
}

export default GoalTaskForm;
