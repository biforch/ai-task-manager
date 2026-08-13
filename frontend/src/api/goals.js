import axios from "axios";

const API_URL = "http://localhost:3000/api/goals";

export const saveGoal = (draft) => {
  return axios.post(API_URL, draft);
};

export const getGoals = () => {
  return axios.get(API_URL);
};

export const getGoalById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};
