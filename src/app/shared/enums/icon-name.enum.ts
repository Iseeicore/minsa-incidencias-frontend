export const IconName = {
  EYE: "eye",
  EYE_OFF: "eye-off",
  SPINNER: "spinner",
  ALERT: "alert",
} as const;
export type IconName = (typeof IconName)[keyof typeof IconName];
