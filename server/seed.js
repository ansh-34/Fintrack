import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Transaction from "./models/Transaction.js";

const USERS = [
  { name: "Ravi Kumar", email: "admin@fintrack.com", password: "admin123", role: "admin" },
  { name: "Priya Sharma", email: "analyst@fintrack.com", password: "analyst123", role: "analyst" },
  { name: "Amit Singh", email: "viewer@fintrack.com", password: "viewer123", role: "viewer" },
];

const MERCHANTS = [
  "Flipkart", "Amazon India", "Swiggy", "Zomato", "BigBasket",
  "Netflix", "Uber", "Ola", "PhonePe", "Local Kirana", "Myntra",
  "BookMyShow", "IRCTC", "Apollo Pharmacy", "Coursera",
];

const TX_TEMPLATES = [
  { type: "income", category: "salary", merchant: "TCS", paymentMethod: "bank_transfer", amountRange: [40000, 80000] },
  { type: "income", category: "freelance", merchant: "Upwork", paymentMethod: "bank_transfer", amountRange: [5000, 25000] },
  { type: "income", category: "investments", merchant: "Zerodha", paymentMethod: "bank_transfer", amountRange: [1000, 15000] },
  { type: "expense", category: "rent", merchant: "Landlord", paymentMethod: "upi", amountRange: [8000, 25000] },
  { type: "expense", category: "utilities", merchant: "Tata Power", paymentMethod: "upi", amountRange: [500, 3000] },
  { type: "expense", category: "groceries", merchant: "BigBasket", paymentMethod: "credit_card", amountRange: [800, 5000] },
  { type: "expense", category: "food", merchant: "Swiggy", paymentMethod: "upi", amountRange: [100, 1500] },
  { type: "expense", category: "transport", merchant: "Uber", paymentMethod: "upi", amountRange: [100, 2000] },
  { type: "expense", category: "entertainment", merchant: "Netflix", paymentMethod: "credit_card", amountRange: [199, 1500] },
  { type: "expense", category: "shopping", merchant: "Flipkart", paymentMethod: "debit_card", amountRange: [500, 10000] },
  { type: "expense", category: "healthcare", merchant: "Apollo Pharmacy", paymentMethod: "cash", amountRange: [200, 5000] },
  { type: "expense", category: "education", merchant: "Coursera", paymentMethod: "credit_card", amountRange: [500, 8000] },
  { type: "expense", category: "travel", merchant: "IRCTC", paymentMethod: "debit_card", amountRange: [500, 15000] },
];

const TAGS_POOL = [
  "essential", "recurring", "one-time", "planned", "impulse",
  "tax-deductible", "reimbursable", "personal", "family", "work",
];

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(monthsBack) {
  const now = new Date();
  const past = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

function randomTags() {
  const count = Math.floor(Math.random() * 3);
  const shuffled = [...TAGS_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log("Cleared existing data");

    // create users
    const createdUsers = [];
    for (const u of USERS) {
      const user = await User.create(u);
      createdUsers.push(user);
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    const [admin, analyst] = createdUsers;

    // create transactions - 60 records spread across 12 months
    const transactions = [];
    for (let i = 0; i < 60; i++) {
      const template = TX_TEMPLATES[i % TX_TEMPLATES.length];
      const owner = i % 3 === 0 ? admin : analyst; // admin and analyst create records

      transactions.push({
        amount: randomBetween(template.amountRange[0], template.amountRange[1]),
        type: template.type,
        category: template.category,
        date: randomDate(12),
        description: `${template.type === "income" ? "Received" : "Paid"} - ${template.merchant}`,
        merchant: template.merchant,
        paymentMethod: template.paymentMethod,
        tags: randomTags(),
        createdBy: owner._id,
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`Created ${transactions.length} transactions`);

    console.log("\n--- Seed Complete ---");
    console.log("Login credentials:");
    console.log("  Admin:   admin@fintrack.com   / admin123");
    console.log("  Analyst: analyst@fintrack.com / analyst123");
    console.log("  Viewer:  viewer@fintrack.com  / viewer123");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
