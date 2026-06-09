export const taskKeys = {
  all: ["tasks"] as const,
  team: () => [...taskKeys.all, "team"] as const,
  mine: () => [...taskKeys.all, "mine"] as const,
};
