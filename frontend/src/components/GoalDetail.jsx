import { useEffect, useState } from "react";

import axios from "axios";

import { getGoalById } from "../api/goals";
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

  const onUpdate = async (id, data) => {
    try {
      await axios.put(`http://localhost:3000/api/tasks/${id}`, data);

      await loadGoalDetail();

      if (onGoalUpdated) {
        onGoalUpdated();
      }
    } catch (requestError) {
      console.error("Failed to update task:", requestError);
    }
  };

  if (loading) {
    return (
      <section className="goal-detail">
        <p className="status-message">加载目标详情...</p>
      </section>
    );
  }

  if (error || !goal) {
    return (
      <section className="goal-detail">
        <p className="error-message">{error || "目标不存在"}</p>
        <button type="button" onClick={onBack}>
          返回全部任务
        </button>
      </section>
    );
  }

  const progressLabel = `${goal.doneCount}/${goal.taskCount} (${goal.completedPercentage}%)`;

  return (
    <section className="goal-detail">
      <button type="button" className="goal-detail-back" onClick={onBack}>
        返回全部任务
      </button>

      <h2>{goal.title}</h2>

      {goal.description && <p className="goal-detail-description">{goal.description}</p>}

      <p className="goal-detail-progress">进度：{progressLabel}</p>

      {tasks.length === 0 ? (
        <p className="status-message">该目标下暂无任务。</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </section>
  );
}

export default GoalDetail;
