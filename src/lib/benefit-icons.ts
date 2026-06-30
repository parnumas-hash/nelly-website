import {
  Award,
  Headphones,
  Heart,
  Leaf,
  LucideIcon,
  Shield,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { BenefitIconName } from "@/types";

const BENEFIT_ICONS: Record<BenefitIconName, LucideIcon> = {
  award: Award,
  shield: Shield,
  truck: Truck,
  headphones: Headphones,
  heart: Heart,
  star: Star,
  sparkles: Sparkles,
  leaf: Leaf,
};

export function getBenefitIcon(name: BenefitIconName): LucideIcon {
  return BENEFIT_ICONS[name] ?? Award;
}
