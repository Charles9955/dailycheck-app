// ---- Core domain types for DailyCheck ----

export type BillingCycle = "weekly" | "monthly" | "quarterly" | "yearly";

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  renewalDate: string; // ISO date (YYYY-MM-DD)
  category: string;
  color: string; // hex accent for the card
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO date (YYYY-MM-DD)
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate: string; // ISO date (YYYY-MM-DD)
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  deadline: string; // ISO date (YYYY-MM-DD)
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  subscriptions: Subscription[];
  expenses: Expense[];
  tasks: Task[];
  goals: Goal[];
  notes: Note[];
}

// Unified calendar event used by the calendar view
export type CalendarEventType = "subscription" | "task" | "goal";

export interface CalendarEvent {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  title: string;
  type: CalendarEventType;
  color: string;
  meta?: string;
}
