import polls from "./mockDatabase";

function generatePollId() {
  return Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();
}

export const mockPollApi = {
  async createPoll({ question, options }) {
    const id = generatePollId();

    const poll = {
      id,
      question,
      options,
      votes: options.map(() => 0),
      status: "active",
    };

    polls.set(id, poll);

    return poll;
  },

  async getPoll(pollId) {
    const poll = polls.get(pollId);

    if (!poll) {
      throw new Error("Poll not found");
    }

    return poll;
  },

  async getMyPolls() {
    return Array.from(polls.values());
  },

  async submitVote(pollId, optionIndex) {
    const poll = polls.get(pollId);

    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.status !== "active") {
      throw new Error("Poll is closed");
    }

    if (
      optionIndex < 0 ||
      optionIndex >= poll.options.length
    ) {
      throw new Error("Invalid option");
    }

    poll.votes[optionIndex] += 1;

    return poll;
  },
};