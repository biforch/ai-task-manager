import { useState } from "react";

import { planGoal } from "../api/ai";
import { saveGoal } from "../api/goals";
import { resolvePlanGenerateError } from "../utils/planErrors";
import GoalPlanPreview from "./GoalPlanPreview";

function GoalCreateFlow({ onCancel, onSaved }) {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [canRetry, setCanRetry] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [draft, setDraft] = useState(null);

  const generatePlan = async () => {
    if (!goal.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCanRetry(false);
      setSaveError("");
      setDraft(null);

      const response = await planGoal(goal.trim());
      setDraft(response.data);
    } catch (requestError) {
      const resolved = resolvePlanGenerateError(requestError);
      setError(resolved.message);
      setCanRetry(resolved.canRetry);
      setDraft(null);
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

      const response = await saveGoal({
        goalTitle: draft.goalTitle,
        goalDescription: goal.trim(),
        tasks: draft.tasks
      });

      setGoal("");
      setDraft(null);

      if (onSaved) {
        onSaved(response.data.goal.id);
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.error || "Failed to save goal";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const cancelFlow = () => {
    setDraft(null);
    setSaveError("");

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <section className="workspace-panel goal-create-flow">
      <button type="button" className="button-secondary back-button" onClick={cancelFlow}>
        返回工作台
      </button>

      <h2 className="panel-title">新建目标（AI）</h2>

      <p className="disclaimer-message">
        AI 提供一般行动建议，不替代医疗、法律或其他专业意见。
      </p>

      <div className="goal-create-input">
        <input
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          placeholder="例如：30 天学会 React"
          disabled={loading || saving}
        />

        <button
          type="button"
          className="button-primary"
          onClick={generatePlan}
          disabled={loading || saving || !goal.trim()}
        >
          {loading ? "生成中..." : "Generate Plan"}
        </button>
      </div>

      {error && (
        <div className="plan-error-panel">
          <p className="error-message">{error}</p>
          {canRetry && (
            <button
              type="button"
              className="button-secondary"
              onClick={generatePlan}
              disabled={loading || saving || !goal.trim()}
            >
              重新生成
            </button>
          )}
        </div>
      )}

      <GoalPlanPreview
        plan={draft}
        onConfirm={confirmSave}
        onCancel={() => {
          setDraft(null);
          setSaveError("");
        }}
        saving={saving}
        error={saveError}
      />
    </section>
  );
}

export default GoalCreateFlow;
