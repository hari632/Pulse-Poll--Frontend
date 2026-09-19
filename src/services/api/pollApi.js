import { client } from "./client";

const WS_BASE_URL =
  import.meta.env.VITE_WS_URL ||
  (import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/^http/, "ws")
    : "ws://localhost:8080/api/v1");

export const realPollApi = {
  async createPoll({ question, options }) {
    const data = await client.post("/polls", {
      question: question.trim(),
      options: options.map((opt) => opt.trim()).filter(Boolean),
    });

    return data.poll || data;
  },

  async getPoll(pollId) {
    const cleanId = String(pollId).trim();
    const data = await client.get(`/polls/${encodeURIComponent(cleanId)}`);
    return data.poll || data;
  },

  async getMyPolls() {
    const data = await client.get("/polls");
    return Array.isArray(data.polls) ? data.polls : [];
  },

  async submitVote(pollId, optionIndex, voterId) {
    const cleanId = String(pollId).trim();
    const payload = {
      optionIndex: Number(optionIndex),
    };

    if (voterId) {
      payload.voterId = voterId;
    }

    const data = await client.post(`/polls/${encodeURIComponent(cleanId)}/vote`, payload);
    return data.poll || data;
  },

  async closePoll(pollId) {
    const cleanId = String(pollId).trim();
    const data = await client.patch(`/polls/${encodeURIComponent(cleanId)}/close`);
    return data.poll || data;
  },

  async getResults(pollId) {
    const cleanId = String(pollId).trim();
    return client.get(`/polls/${encodeURIComponent(cleanId)}/results`);
  },

  subscribeToResults(pollId, onUpdate) {
    if (!pollId) return () => {};

    const cleanId = String(pollId).trim();
    const base = WS_BASE_URL.replace(/\/+$/, "");
    const wsUrl = `${base}/polls/${encodeURIComponent(cleanId)}/live`;

    let socket = null;

    try {
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (typeof onUpdate === "function") {
            onUpdate(payload);
          }
        } catch {
          // Ignore unparseable WebSocket message
        }
      };

      socket.onerror = () => {
        // WebSocket error handled gracefully
      };

      socket.onclose = () => {
        // Connection closed
      };
    } catch {
      // Unable to instantiate WebSocket in environment
    }

    return () => {
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    };
  },
};
