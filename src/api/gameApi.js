const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const gameApi = {
  startSession: async (patientName) => {
    console.log("[API] startSession", patientName);
    localStorage.setItem("nj_patient", patientName);
    return { sessionId: Date.now(), patientName };
  },

  completeRound: async (sessionId, roundData) => {
    console.log("[API] completeRound", sessionId, roundData);
    return { success: true };
  },

  completeGame: async (sessionId) => {
    console.log("[API] completeGame", sessionId);
    return { success: true };
  },
};
