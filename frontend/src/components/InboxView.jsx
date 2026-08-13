import { useEffect, useState } from "react";

import { createTask, deleteTask, getTasks, updateTask } from "../api/tasks";
import CompletedTasksSection from "./CompletedTasksSection";
import TaskCard from "./TaskCard";

function InboxView({ refreshKey, onBack, onTasksChanged }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInbox();
  }, [refreshKey]);

  const loadInbox = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTasks();
      setTasks(response.data.filter((task) => task.goal_id === null));
    } catch (requestError) {
      const message =
        requestError.response?.data?.error || "Failed to load inbox tasks";
      setError(message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const notifyChanged = async () => {
    await loadInbox();

    if (onTasksChanged) {
      onTasksChanged();
    }
  };

  const handleCreate = async (event) => {
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
        status: "todo"
      });

      setTitle("");
      setDescription("");
      await notifyChanged();
    } catch (requestError) {
      const message =
        requestError.response?.data?.error || "Failed to create task";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateTask(id, data);
      await notifyChanged();
    } catch (requestError) {
      console.error("Failed to update inbox task:", requestError);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      await notifyChanged();
    } catch (requestError) {
      console.error("Failed to delete inbox task:", requestError);
    }
  };

  const doingTasks = tasks.filter((task) => task.status === "doing");
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <section className="workspace-panel inbox-view">
      <button type="button" className="button-secondary back-button" onClick={onBack}>
        返回工作台
      </button>

      <h2 className="panel-title">收集箱</h2>
      <p className="status-message">这里只显示未归属任何目标的手动任务。</p>

      <form className="task-form inbox-task-form" onSubmit={handleCreate}>
        <h3 className="subsection-title">快速添加</h3>
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
          {submitting ? "添加中..." : "添加到收集箱"}
        </button>
      </form>

      {loading && <p className="status-message">加载中...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p className="status-message">收集箱为空。</p>
      )}

      {!loading && !error && doingTasks.length > 0 && (
        <section className="task-section">
          <h3 className="subsection-title">进行中任务</h3>
          <div className="task-list">
            {doingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && !error && todoTasks.length > 0 && (
        <section className="task-section">
          <h3 className="subsection-title">待完成任务</h3>
          <div className="task-list">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && !error && doneTasks.length > 0 && (
        <CompletedTasksSection
          tasks={doneTasks}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}

export default InboxView;
