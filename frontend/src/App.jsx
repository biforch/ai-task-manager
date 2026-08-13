import { useState } from "react";

import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import AIGenerator from "./components/AIGenerator";
import GoalList from "./components/GoalList";
import GoalDetail from "./components/GoalDetail";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  const refreshAll = () => {
    setRefreshKey((current) => current + 1);
  };

  const handleGoalUpdated = () => {
    refreshAll();
  };

  return (
    <div>
      <h1>AI Task Manager</h1>

      <TaskForm onCreated={refreshAll} />

      <AIGenerator onGenerated={refreshAll} />

      <GoalList
        refreshKey={refreshKey}
        selectedGoalId={selectedGoalId}
        onSelectGoal={setSelectedGoalId}
      />

      {selectedGoalId ? (
        <GoalDetail
          goalId={selectedGoalId}
          onBack={() => setSelectedGoalId(null)}
          onGoalUpdated={handleGoalUpdated}
        />
      ) : (
        <>
          <h2 className="section-heading">全部任务</h2>
          <TaskList refresh={refreshKey} />
        </>
      )}
    </div>
  );
}

export default App;
