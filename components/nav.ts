import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  CheckSquare,
  Target,
  StickyNote,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  accent: string;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, accent: "#5b6cff" },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard, accent: "#a855f7" },
  { href: "/expenses", label: "Expenses", icon: Wallet, accent: "#3ecf8e" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, accent: "#f5a623" },
  { href: "/goals", label: "Goals", icon: Target, accent: "#22d3ee" },
  { href: "/notes", label: "Notes", icon: StickyNote, accent: "#f2557d" },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, accent: "#7c89ff" },
];
