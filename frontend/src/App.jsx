import { useEffect, useState } from "react";

import { getGoalById } from "./api/goals";
import GoalCreateFlow from "./components/GoalCreateFlow";
import GoalDashboard from "./components/GoalDashboard";
import GoalDetail from "./components/GoalDetail";
import InboxView from "./components/InboxView";
import { readGoalIdFromUrl, setGoalIdInUrl } from "./utils/urlState";

function App() {
  const [view, setView] = useState("dashboard");
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bootstrapError, setBootstrapError] = useState("");
  const [bootstrapping, setBootstrapping] = useState(true);

  const refreshAll = () => {
    setRefreshKey((current) => current + 1);
  };

  const openDashboard = (errorMessage = "") => {
    setGoalIdInUrl(null);
    setView("dashboard");
    setSelectedGoalId(null);
    setBootstrapError(errorMessage);
  };

  const openCreateGoal = () => {
    setGoalIdInUrl(null);
    setView("create-goal");
    setSelectedGoalId(null);
    setBootstrapError("");
  };

  const openInbox = () => {
    setGoalIdInUrl(null);
    setView("inbox");
    setSelectedGoalId(null);
    setBootstrapError("");
  };

  const openGoalDetail = (goalId) => {
    setGoalIdInUrl(goalId);
    setView("goal-detail");
    setSelectedGoalId(goalId);
    setBootstrapError("");
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrapFromUrl = async () => {
      const goalId = readGoalIdFromUrl();

      if (!goalId) {
        if (!cancelled) {
          setBootstrapping(false);
        }
        return;
      }

      try {
        await getGoalById(goalId);

        if (!cancelled) {
          setView("goal-detail");
          setSelectedGoalId(goalId);
          setBootstrapError("");
        }
      } catch (requestError) {
        const message =
          requestError.response?.data?.error || "无法打开目标详情";

        if (!cancelled) {
          setGoalIdInUrl(null);
          setView("dashboard");
          setSelectedGoalId(null);
          setBootstrapError(message);
        }
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    };

    bootstrapFromUrl();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleGoalSaved = (goalId) => {
    refreshAll();
    openGoalDetail(goalId);
  };

  if (bootstrapping) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <h1>AI Task Manager</h1>
        </header>
        <main className="app-main">
          <p className="status-message">正在加载...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>AI Task Manager</h1>
        <p className="app-subtitle">Goal-first 工作台</p>
      </header>

      <main className="app-main">
        {bootstrapError && view === "dashboard" && (
          <p className="error-message global-error" role="alert">
            {bootstrapError}
          </p>
        )}

        {view === "dashboard" && (
          <GoalDashboard
            refreshKey={refreshKey}
            onCreateGoal={openCreateGoal}
            onOpenGoal={openGoalDetail}
            onOpenInbox={openInbox}
          />
        )}

        {view === "create-goal" && (
          <GoalCreateFlow
            onCancel={() => openDashboard()}
            onSaved={handleGoalSaved}
          />
        )}

        {view === "goal-detail" && selectedGoalId && (
          <GoalDetail
            goalId={selectedGoalId}
            onBack={() => openDashboard()}
            onGoalUpdated={refreshAll}
          />
        )}

        {view === "inbox" && (
          <InboxView
            refreshKey={refreshKey}
            onBack={() => openDashboard()}
            onTasksChanged={refreshAll}
          />
        )}
      </main>
    </div>
  );
}

export default App;
