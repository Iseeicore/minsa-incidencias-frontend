import {
  LucideCircleAlert,
  LucideEye,
  LucideEyeOff,
  LucideLoaderCircle,
  type LucideIconData,
} from "@lucide/angular";
import { IconName } from "@/shared/enums/icon-name.enum";

export const ICONS: Record<IconName, LucideIconData> = {
  [IconName.EYE]: LucideEye.icon,
  [IconName.EYE_OFF]: LucideEyeOff.icon,
  [IconName.SPINNER]: LucideLoaderCircle.icon,
  [IconName.ALERT]: LucideCircleAlert.icon,
};
