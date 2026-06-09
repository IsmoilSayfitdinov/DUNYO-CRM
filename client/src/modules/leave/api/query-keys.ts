export const leaveKeys = {
  all: ["leave-requests"] as const,
  me: () => [...leaveKeys.all, "me"] as const,
  team: () => [...leaveKeys.all, "team"] as const,
};
