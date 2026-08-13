import { useEffect, useState } from "react";

import { getGoals } from "../api/goals";
import { getTasks } from "../api/tasks";

function GoalDashboard({
  refreshKey,
  onCreateGoal,
  onOpenGoal,
  onOpenInbox
}) {
  const [goals, setGoals] = useState([]);
  const [inboxCount, setInboxCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, [refreshKey]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [goalsResponse, tasksResponse] = await Promise.all([
        getGoals(),
        getTasks()
      ]);

      setGoals(goalsResponse.data);
      setInboxCount(
        tasksResponse.data.filter((task) => task.goal_id === null).length
      );
    } catch (requestError) {
      const message =
        requestError.response?.data?.error || "Failed to load goals";
      setError(message);
      setGoals([]);
      setInboxCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="workspace-panel">
        <p className="status-message">加载目标工作台...</p>
      </section>
    );
  }

  return (
    <section className="workspace-panel goal-dashboard">
      <div className="dashboard-toolbar">
        <button type="button" className="button-primary" onClick={onCreateGoal}>
          新建目标（AI）
        </button>
        <button type="button" className="button-secondary" onClick={onOpenInbox}>
          收集箱（{inboxCount}）
        </button>
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {!error && goals.length === 0 && (
        <div className="empty-state">
          <p className="status-message">还没有保存的目标。</p>
          <p className="status-message">点击「新建目标（AI）」开始规划。</p>
        </div>
      )}

      {!error && goals.length > 0 && (
        <ul className="goal-dashboard-list">
          {goals.map((goal) => {
            const pendingCount = goal.todoCount + goal.doingCount;
            const progressLabel = `${goal.doneCount}/${goal.taskCount} (${goal.completedPercentage}%)`;

            return (
              <li key={goal.id}>
                <button
                  type="button"
                  className="goal-dashboard-card"
                  onClick={() => onOpenGoal(goal.id)}
                >
                  <span className="goal-dashboard-card-title">{goal.title}</span>
                  <span className="goal-dashboard-card-meta">
                    进度 {progressLabel}
                  </span>
                  <span className="goal-dashboard-card-meta">
                    待完成任务 {pendingCount}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default GoalDashboard;
