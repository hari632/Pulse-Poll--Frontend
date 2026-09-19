import { realPollApi } from "./pollApi";
import { mockPollApi } from "../mock/pollApi";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

export const pollApi = USE_MOCK_API ? mockPollApi : realPollApi;
export { authApi } from "./authApi";
export { client } from "./client";