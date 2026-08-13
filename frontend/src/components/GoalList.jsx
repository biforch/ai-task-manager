import { useEffect, useState } from "react";

import { getGoals } from "../api/goals";

function GoalList({ refreshKey, selectedGoalId, onSelectGoal }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGoals();
  }, [refreshKey]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getGoals();
      setGoals(response.data);
    } catch (requestError) {
      const message =
        requestError.response?.data?.error || "Failed to load goals";
      setError(message);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="goal-list">
        <h2>目标列表</h2>
        <p className="status-message">加载中...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="goal-list">
        <h2>目标列表</h2>
        <p className="error-message">{error}</p>
        <button type="button" onClick={loadGoals}>
          重试
        </button>
      </section>
    );
  }

  if (goals.length === 0) {
    return (
      <section className="goal-list">
        <h2>目标列表</h2>
        <p className="status-message">暂无目标，可通过 AI 规划创建。</p>
      </section>
    );
  }

  return (
    <section className="goal-list">
      <h2>目标列表</h2>

      <ul className="goal-list-items">
        {goals.map((goal) => {
          const progressLabel = `${goal.doneCount}/${goal.taskCount} (${goal.completedPercentage}%)`;
          const isSelected = selectedGoalId === goal.id;

          return (
            <li key={goal.id}>
              <button
                type="button"
                className={`goal-list-item${isSelected ? " goal-list-item-selected" : ""}`}
                onClick={() => onSelectGoal(goal.id)}
              >
                <span className="goal-list-title">{goal.title}</span>
                <span className="goal-list-progress">{progressLabel}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default GoalList;
