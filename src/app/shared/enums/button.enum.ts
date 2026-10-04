export const ButtonVariant = {
  SOLID: "solid",
  OUTLINE: "outline",
} as const;
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

export const ButtonTone = {
  PRIMARY: "primary",
  DANGER: "danger",
  NEUTRAL: "neutral",
} as const;
export type ButtonTone = (typeof ButtonTone)[keyof typeof ButtonTone];

export const ButtonSize = {
  SM: "sm",
  MD: "md",
} as const;
export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];
