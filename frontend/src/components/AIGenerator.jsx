import { useState } from "react";

import { planGoal } from "../api/ai";
import { saveGoal } from "../api/goals";
import GoalPlanPreview from "./GoalPlanPreview";

function AIGenerator({ onGenerated }) {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [draft, setDraft] = useState(null);

  const generatePlan = async () => {
    if (!goal.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSaveError("");
      setDraft(null);

      const response = await planGoal(goal.trim());
      setDraft(response.data);
    } catch (requestError) {
      const message =
        requestError.response?.data?.error || "Failed to generate plan";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const confirmSave = async () => {
    if (!draft) {
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      await saveGoal({
        goalTitle: draft.goalTitle,
        goalDescription: goal.trim(),
        tasks: draft.tasks
      });

      setGoal("");
      setDraft(null);

      if (onGenerated) {
        onGenerated();
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.error || "Failed to save goal";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const cancelPreview = () => {
    setDraft(null);
    setSaveError("");
  };

  return (
    <div className="ai-generator">
      <h2>AI Goal Planner</h2>

      <input
        value={goal}
        onChange={(event) => setGoal(event.target.value)}
        placeholder="例如：30天学会React"
        disabled={loading || saving}
      />

      <button
        type="button"
        onClick={generatePlan}
        disabled={loading || saving || !goal.trim()}
      >
        {loading ? "Generating..." : "Generate Plan"}
      </button>

      {error && <p className="error-message">{error}</p>}

      <GoalPlanPreview
        plan={draft}
        onConfirm={confirmSave}
        onCancel={cancelPreview}
        saving={saving}
        error={saveError}
      />
    </div>
  );
}

export default AIGenerator;
