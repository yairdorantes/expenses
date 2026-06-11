import type { ReactNode } from "react";
import {
  MdAccountBalance,
  MdAttachMoney,
  MdCardGiftcard,
  MdCheckroom,
  MdCommute,
  MdDirectionsBike,
  MdDirectionsCar,
  MdFastfood,
  MdFlight,
  MdHealthAndSafety,
  MdHome,
  MdLocalGasStation,
  MdMoneyOff,
  MdMore,
  MdPayment,
  MdSchool,
  MdSelfImprovement,
  MdTheaterComedy,
} from "react-icons/md";

export interface CategoryOption {
  value: string;
  label: string;
}

interface CategoryPresentation {
  color: string;
  icon: ReactNode;
}

export const fallbackCategories: CategoryOption[] = [
  { value: "1", label: "Health" },
  { value: "2", label: "Food" },
  { value: "3", label: "Transportation" },
  { value: "4", label: "Housing" },
  { value: "5", label: "Utilities" },
  { value: "6", label: "Entertainment" },
  { value: "7", label: "Clothing" },
  { value: "8", label: "Education" },
  { value: "9", label: "Travel" },
  { value: "10", label: "Personal Care" },
  { value: "11", label: "Gifts" },
  { value: "12", label: "Insurance" },
  { value: "13", label: "Investments" },
  { value: "14", label: "Lend money" },
  { value: "15", label: "Repayment" },
  { value: "16", label: "Paycheck" },
  { value: "17", label: "Other" },
  { value: "18", label: "Bicycle" },
  { value: "19", label: "Car" },
];

const categoryPresentationByLabel: Record<string, CategoryPresentation> = {
  health: { color: "#EF4444", icon: <MdHealthAndSafety /> },
  food: { color: "#F59E0B", icon: <MdFastfood /> },
  transportation: { color: "#EC4899", icon: <MdCommute /> },
  housing: { color: "#8B5CF6", icon: <MdHome /> },
  utilities: { color: "#06B6D4", icon: <MdLocalGasStation /> },
  entertainment: { color: "#0EA5E9", icon: <MdTheaterComedy /> },
  clothing: { color: "#F97316", icon: <MdCheckroom /> },
  education: { color: "#6366F1", icon: <MdSchool /> },
  travel: { color: "#22C55E", icon: <MdFlight /> },
  "personal care": { color: "#E11D48", icon: <MdSelfImprovement /> },
  gifts: { color: "#FB923C", icon: <MdCardGiftcard /> },
  insurance: { color: "#7C3AED", icon: <MdMore /> },
  investments: { color: "#3B82F6", icon: <MdAttachMoney /> },
  "lend money": { color: "#2563EB", icon: <MdAccountBalance /> },
  repayment: { color: "#EAB308", icon: <MdMoneyOff /> },
  paycheck: { color: "#78716C", icon: <MdPayment /> },
  other: { color: "#94A3B8", icon: <MdMore /> },
  bicycle: { color: "#16A34A", icon: <MdDirectionsBike /> },
  car: { color: "#14B8A6", icon: <MdDirectionsCar /> },
};

const fallbackPalette = [
  "#EF4444",
  "#F59E0B",
  "#8B5CF6",
  "#0EA5E9",
  "#22C55E",
  "#F97316",
  "#6366F1",
  "#14B8A6",
  "#94A3B8",
];

const normalizeCategoryLabel = (label: string) => label.trim().toLowerCase();

export const getCategoryLabel = (
  categoryId: string,
  categories: CategoryOption[] = fallbackCategories
) => {
  return (
    categories.find((category) => category.value === categoryId)?.label ||
    fallbackCategories.find((category) => category.value === categoryId)?.label ||
    "Unknown Category"
  );
};

export const getCategoryColor = (
  categoryId: string,
  categoryLabel?: string
) => {
  const label = categoryLabel || getCategoryLabel(categoryId);
  const presentation = categoryPresentationByLabel[normalizeCategoryLabel(label)];

  if (presentation) return presentation.color;

  const colorIndex = Number(categoryId) % fallbackPalette.length;
  return fallbackPalette[colorIndex] || "#64748B";
};

export const getCategoryIcon = (
  categoryId: string,
  categoryLabel?: string
) => {
  const label = categoryLabel || getCategoryLabel(categoryId);
  return (
    categoryPresentationByLabel[normalizeCategoryLabel(label)]?.icon || <MdMore />
  );
};
