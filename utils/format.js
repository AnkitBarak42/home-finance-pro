export const rupee = (n) =>
  "₹" + Math.abs(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const monthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const fmtDay = (d) => d.toLocaleDateString("en-IN", { weekday: "short" });

export const uid = () => Math.random().toString(36).slice(2, 10);

// Given a day-of-month (1-31) and a number of days to add, returns the
// resulting day-of-month — used to auto-derive a credit card's due date
// from its statement/bill-generation date (e.g. +20 days), handling
// month-length rollover correctly via native Date normalization.
export const addDaysToDay = (day, addDays) => {
  const d = new Date(2001, 0, day); // arbitrary non-leap reference month
  d.setDate(d.getDate() + addDays);
  return d.getDate();
};

export const PAYMENT_MODES = ["Cash", "UPI", "Card", "Netbanking", "Wallet"];

export const CATEGORY_COLORS = [
  "#F0506B", "#1FAE7C", "#F5A623", "#5B4FE8", "#4FA8E0",
  "#F26E9A", "#6FCF97", "#E0A458", "#5BC0DE", "#C77DFF",
  "#FF9F6B", "#6BE0D0",
];

export const DEFAULT_CATEGORIES = [
  { name: "Milk", icon: "🥛", color: CATEGORY_COLORS[0], type: "expense", budget: 3000, parentId: null },
  { name: "Grocery", icon: "🛒", color: CATEGORY_COLORS[1], type: "expense", budget: 6000, parentId: null },
  { name: "Vegetables", icon: "🥦", color: CATEGORY_COLORS[2], type: "expense", budget: 0, parentId: null },
  { name: "Fruits", icon: "🍎", color: CATEGORY_COLORS[3], type: "expense", budget: 0, parentId: null },
  {
    name: "Food & Dining", icon: "🍽️", color: CATEGORY_COLORS[4], type: "expense", budget: 0, parentId: null,
    // Example subcategories seeded on signup — shows how to break any
    // category down further. Add/remove your own anytime from Categories.
    children: [
      { name: "Fast Food", icon: "🍔", color: CATEGORY_COLORS[0] },
      { name: "Cold Drink", icon: "🥤", color: CATEGORY_COLORS[5] },
      { name: "Restaurant / Meal", icon: "🍛", color: CATEGORY_COLORS[6] },
      { name: "Tea / Coffee", icon: "☕", color: CATEGORY_COLORS[7] },
    ],
  },
  { name: "Petrol/Fuel", icon: "⛽", color: CATEGORY_COLORS[4], type: "expense", budget: 5000, parentId: null },
  { name: "Electricity", icon: "💡", color: CATEGORY_COLORS[5], type: "expense", budget: 0, parentId: null },
  { name: "Water", icon: "🚰", color: CATEGORY_COLORS[6], type: "expense", budget: 0, parentId: null },
  { name: "Mobile/Internet", icon: "📶", color: CATEGORY_COLORS[7], type: "expense", budget: 0, parentId: null },
  { name: "School Fees", icon: "🎒", color: CATEGORY_COLORS[8], type: "expense", budget: 0, parentId: null },
  { name: "Medicine", icon: "💊", color: CATEGORY_COLORS[9], type: "expense", budget: 0, parentId: null },
  { name: "Shopping", icon: "🛍️", color: CATEGORY_COLORS[10], type: "expense", budget: 0, parentId: null },
  { name: "Travel", icon: "🧳", color: CATEGORY_COLORS[11], type: "expense", budget: 0, parentId: null },
  { name: "Entertainment", icon: "🎬", color: CATEGORY_COLORS[0], type: "expense", budget: 0, parentId: null },
  { name: "Insurance", icon: "🛡️", color: CATEGORY_COLORS[1], type: "expense", budget: 0, parentId: null },
  { name: "EMI", icon: "🏦", color: CATEGORY_COLORS[2], type: "expense", budget: 0, parentId: null },
  { name: "Credit Card Payment", icon: "💳", color: CATEGORY_COLORS[3], type: "expense", budget: 0, parentId: null },
  { name: "Vehicle Maintenance", icon: "🚗", color: CATEGORY_COLORS[4], type: "expense", budget: 0, parentId: null },
  { name: "Other", icon: "📦", color: CATEGORY_COLORS[5], type: "expense", budget: 0, parentId: null },
  { name: "Salary", icon: "💼", color: CATEGORY_COLORS[6], type: "income", budget: 0, parentId: null },
  { name: "DA/Bonus", icon: "🎁", color: CATEGORY_COLORS[7], type: "income", budget: 0, parentId: null },
  { name: "Interest", icon: "📈", color: CATEGORY_COLORS[8], type: "income", budget: 0, parentId: null },
  { name: "Rental Income", icon: "🏠", color: CATEGORY_COLORS[9], type: "income", budget: 0, parentId: null },
  { name: "Other Income", icon: "💰", color: CATEGORY_COLORS[10], type: "income", budget: 0, parentId: null },
];

export const DEFAULT_ACCOUNTS = [
  { name: "Cash", type: "Cash", balance: 0 },
  { name: "Bank", type: "Bank", balance: 0 },
  { name: "UPI", type: "Wallet", balance: 0 },
];

// Returns "Parent ▸ Sub" if the category has a parent, else just its own name.
export const categoryLabel = (cat, catMap) => {
  if (!cat) return "Uncategorized";
  if (cat.parentId && catMap[cat.parentId]) return `${catMap[cat.parentId].name} ▸ ${cat.name}`;
  return cat.name;
};
