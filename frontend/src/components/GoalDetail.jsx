import { useEffect, useState } from "react";

import { getGoalById } from "../api/goals";
import { deleteTask, updateTask } from "../api/tasks";
import CompletedTasksSection from "./CompletedTasksSection";
import GoalTaskForm from "./GoalTaskForm";
import TaskCard from "./TaskCard";

function GoalDetail({ goalId, onBack, onGoalUpdated }) {
  const [goal, setGoal] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGoalDetail();
  }, [goalId]);

  const loadGoalDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getGoalById(goalId);
      setGoal(response.data.goal);
      setTasks(response.data.tasks);
    } catch (requestError) {
      const message =
        requestError.response?.data?.error || "Failed to load goal";
      setError(message);
      setGoal(null);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const notifyUpdated = async () => {
    await loadGoalDetail();

    if (onGoalUpdated) {
      onGoalUpdated();
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateTask(id, data);
      await notifyUpdated();
    } catch (requestError) {
      console.error("Failed to update task:", requestError);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      await notifyUpdated();
    } catch (requestError) {
      console.error("Failed to delete task:", requestError);
    }
  };

  if (loading) {
    return (
      <section className="workspace-panel goal-detail">
        <p className="status-message">加载目标详情...</p>
      </section>
    );
  }

  if (error || !goal) {
    return (
      <section className="workspace-panel goal-detail">
        <p className="error-message">{error || "目标不存在"}</p>
        <button type="button" className="button-secondary" onClick={onBack}>
          返回工作台
        </button>
      </section>
    );
  }

  const doingTasks = tasks.filter((task) => task.status === "doing");
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const doneTasks = tasks.filter((task) => task.status === "done");
  const progressLabel = `${goal.doneCount}/${goal.taskCount} (${goal.completedPercentage}%)`;

  return (
    <section className="workspace-panel goal-detail">
      <button type="button" className="button-secondary back-button" onClick={onBack}>
        返回工作台
      </button>

      <h2 className="panel-title">{goal.title}</h2>

      {goal.description && (
        <p className="goal-detail-description">{goal.description}</p>
      )}

      <p className="goal-detail-progress">进度：{progressLabel}</p>

      <GoalTaskForm goalId={goal.id} onCreated={notifyUpdated} />

      {doingTasks.length > 0 && (
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

      {todoTasks.length > 0 && (
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

      {doingTasks.length === 0 && todoTasks.length === 0 && doneTasks.length === 0 && (
        <p className="status-message">该目标下暂无任务，可在上方新增。</p>
      )}

      <CompletedTasksSection
        tasks={doneTasks}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </section>
  );
}

export default GoalDetail;
