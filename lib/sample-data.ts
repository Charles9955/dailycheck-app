import type { AppData } from "./types";
import { uid, dateThisMonth, dateOffset, todayISO } from "./utils";

// Seed data so the app feels alive on first launch.
export function seedData(): AppData {
  return {
    subscriptions: [
      { id: uid(), name: "Netflix", price: 15.49, billingCycle: "monthly", renewalDate: dateThisMonth(18), category: "Entertainment", color: "#e50914" },
      { id: uid(), name: "Spotify", price: 11.99, billingCycle: "monthly", renewalDate: dateThisMonth(24), category: "Entertainment", color: "#1db954" },
      { id: uid(), name: "Notion Plus", price: 96, billingCycle: "yearly", renewalDate: dateOffset(40), category: "Productivity", color: "#ffffff" },
      { id: uid(), name: "ChatGPT Plus", price: 20, billingCycle: "monthly", renewalDate: dateThisMonth(9), category: "AI Tools", color: "#10a37f" },
      { id: uid(), name: "iCloud+", price: 2.99, billingCycle: "monthly", renewalDate: dateThisMonth(3), category: "Storage", color: "#3b82f6" },
      { id: uid(), name: "GitHub Pro", price: 4, billingCycle: "monthly", renewalDate: dateThisMonth(28), category: "Developer", color: "#a855f7" },
      { id: uid(), name: "Adobe CC", price: 599.88, billingCycle: "yearly", renewalDate: dateOffset(120), category: "Creative", color: "#fa0f00" },
    ],
    expenses: [
      { id: uid(), description: "Groceries — Whole Foods", amount: 84.32, category: "Food", date: dateThisMonth(2) },
      { id: uid(), description: "Gas", amount: 52.1, category: "Transport", date: dateThisMonth(4) },
      { id: uid(), description: "Dinner with friends", amount: 63.5, category: "Food", date: dateThisMonth(6) },
      { id: uid(), description: "New running shoes", amount: 129.99, category: "Shopping", date: dateThisMonth(8) },
      { id: uid(), description: "Electricity bill", amount: 78.4, category: "Utilities", date: dateThisMonth(10) },
      { id: uid(), description: "Coffee", amount: 5.75, category: "Food", date: dateThisMonth(11) },
      { id: uid(), description: "Movie tickets", amount: 32, category: "Entertainment", date: dateThisMonth(12) },
      { id: uid(), description: "Pharmacy", amount: 21.4, category: "Health", date: dateThisMonth(14) },
    ],
    tasks: [
      { id: uid(), title: "Finish quarterly report", notes: "Include Q2 revenue charts", dueDate: todayISO(), priority: "high", status: "in-progress", createdAt: todayISO() },
      { id: uid(), title: "Reply to client emails", dueDate: todayISO(), priority: "medium", status: "todo", createdAt: todayISO() },
      { id: uid(), title: "Book dentist appointment", dueDate: dateOffset(2), priority: "low", status: "todo", createdAt: todayISO() },
      { id: uid(), title: "Plan weekend trip", notes: "Compare Airbnb vs hotel", dueDate: dateOffset(5), priority: "medium", status: "todo", createdAt: todayISO() },
      { id: uid(), title: "Review pull requests", dueDate: dateOffset(1), priority: "high", status: "todo", createdAt: todayISO() },
      { id: uid(), title: "Water the plants", dueDate: dateOffset(-1), priority: "low", status: "done", createdAt: dateOffset(-2) },
      { id: uid(), title: "Submit expense reimbursement", dueDate: dateOffset(3), priority: "medium", status: "todo", createdAt: todayISO() },
    ],
    goals: [
      { id: uid(), title: "Read 24 books", category: "Personal", target: 24, current: 11, unit: "books", deadline: dateOffset(200) },
      { id: uid(), title: "Emergency fund", category: "Finance", target: 10000, current: 6400, unit: "kr", deadline: dateOffset(150) },
      { id: uid(), title: "Run 500 km", category: "Fitness", target: 500, current: 318, unit: "km", deadline: dateOffset(90) },
      { id: uid(), title: "Ship side project", category: "Career", target: 100, current: 65, unit: "%", deadline: dateOffset(45) },
      { id: uid(), title: "Learn Spanish", category: "Learning", target: 100, current: 30, unit: "lessons", deadline: dateOffset(180) },
    ],
    notes: [
      {
        id: uid(),
        title: "Weekly review template",
        content:
          "## Wins\n- \n\n## Challenges\n- \n\n## Next week focus\n- \n\nReflect every Sunday evening with a coffee.",
        tags: ["routine", "productivity"],
        createdAt: dateOffset(-7),
        updatedAt: dateOffset(-1),
      },
      {
        id: uid(),
        title: "Book recommendations",
        content:
          "1. Deep Work — Cal Newport\n2. Atomic Habits — James Clear\n3. The Almanack of Naval Ravikant\n4. Four Thousand Weeks — Oliver Burkeman",
        tags: ["reading"],
        createdAt: dateOffset(-12),
        updatedAt: dateOffset(-3),
      },
      {
        id: uid(),
        title: "Trip planning — Lisbon",
        content:
          "Flights ~$450 round trip. Stay in Alfama district. Must do: Belém tower, Time Out Market, day trip to Sintra.",
        tags: ["travel", "ideas"],
        createdAt: dateOffset(-4),
        updatedAt: todayISO(),
      },
      {
        id: uid(),
        title: "App ideas",
        content: "- Habit tracker with streaks\n- Recipe saver from links\n- Personal finance dashboard (this one!)",
        tags: ["ideas", "projects"],
        createdAt: dateOffset(-2),
        updatedAt: dateOffset(-2),
      },
    ],
  };
}
