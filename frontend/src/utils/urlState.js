export function readGoalIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("goalId");

  if (!raw) {
    return null;
  }

  const goalId = Number(raw);

  if (!Number.isInteger(goalId) || goalId <= 0) {
    return null;
  }

  return goalId;
}

export function setGoalIdInUrl(goalId) {
  const url = new URL(window.location.href);

  if (goalId) {
    url.searchParams.set("goalId", String(goalId));
  } else {
    url.searchParams.delete("goalId");
  }

  window.history.replaceState({}, "", url);
}
