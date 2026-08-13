import axios from "axios";

const API_URL = "http://localhost:3000/api/ai";

export const planGoal = (goal) => {
  return axios.post(`${API_URL}/plan`, { goal });
};
