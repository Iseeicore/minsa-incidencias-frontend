export const BadgeTone = {
  NEUTRAL: "neutral",
  PRIMARY: "primary",
  SUCCESS: "success",
  WARNING: "warning",
  DANGER: "danger",
} as const;
export type BadgeTone = (typeof BadgeTone)[keyof typeof BadgeTone];
