function GoalPlanPreview({ plan, onConfirm, onCancel, saving, error }) {
  if (!plan) {
    return null;
  }

  return (
    <div className="goal-plan-preview">
      <div className="draft-banner" role="status">
        AI 方案草案 · 尚未保存
      </div>

      <p className="draft-help">
        当前内容仅用于预览。点击 Confirm Save 后，目标和任务才会写入数据库。
      </p>

      <h3>{plan.goalTitle}</h3>

      <ul className="goal-plan-task-list">
        {plan.tasks.map((task, index) => (
          <li key={`${task.title}-${index}`} className="goal-plan-task-item">
            <strong>{task.title}</strong>
            <p>{task.description}</p>
            <p>
              Priority: {task.priority} | Estimated: {task.estimatedMinutes} min
            </p>
          </li>
        ))}
      </ul>

      {error && <p className="error-message">{error}</p>}

      <div className="goal-plan-actions">
        <button
          type="button"
          className="button-primary"
          onClick={onConfirm}
          disabled={saving}
        >
          {saving ? "Saving..." : "Confirm Save"}
        </button>

        <button
          type="button"
          className="button-secondary"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default GoalPlanPreview;
