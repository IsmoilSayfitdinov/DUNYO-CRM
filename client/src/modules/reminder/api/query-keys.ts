export const reminderKeys = {
  all: ["reminders"] as const,
  team: () => [...reminderKeys.all, "team"] as const,
  mine: () => [...reminderKeys.all, "mine"] as const,
};
