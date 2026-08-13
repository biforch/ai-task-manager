function GoalPlanPreview({ plan, onConfirm, onCancel, saving, error }) {
  if (!plan) {
    return null;
  }

  return (
    <div className="goal-plan-preview">
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
        <button type="button" onClick={onConfirm} disabled={saving}>
          {saving ? "Saving..." : "Confirm Save"}
        </button>

        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default GoalPlanPreview;
