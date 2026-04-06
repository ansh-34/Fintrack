import Transaction from "../models/Transaction.js";

export const getSummary = async () => {
  const result = await Transaction.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
        totalRecords: { $sum: 1 },
        incomeCount: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, 1, 0] },
        },
        expenseCount: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, 1, 0] },
        },
      },
    },
  ]);

  const data = result[0] || {
    totalIncome: 0,
    totalExpense: 0,
    totalRecords: 0,
    incomeCount: 0,
    expenseCount: 0,
  };

  return {
    totalIncome: Math.round(data.totalIncome * 100) / 100,
    totalExpense: Math.round(data.totalExpense * 100) / 100,
    netBalance: Math.round((data.totalIncome - data.totalExpense) * 100) / 100,
    totalRecords: data.totalRecords,
    incomeCount: data.incomeCount,
    expenseCount: data.expenseCount,
  };
};

export const getCategoryBreakdown = async (typeFilter) => {
  const match = { isDeleted: false };
  if (typeFilter) match.type = typeFilter;

  const result = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id.category",
        type: "$_id.type",
        total: { $round: ["$total", 2] },
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  return result;
};

export const getMonthlyTrends = async (months = 12) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const result = await Transaction.aggregate([
    { $match: { isDeleted: false, date: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        income: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // fill in missing months
  const trends = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const label = `${year}-${String(month).padStart(2, "0")}`;

    const found = result.find((r) => r._id.year === year && r._id.month === month);
    trends.push({
      month: label,
      income: found ? Math.round(found.income * 100) / 100 : 0,
      expense: found ? Math.round(found.expense * 100) / 100 : 0,
      net: found
        ? Math.round((found.income - found.expense) * 100) / 100
        : 0,
    });
  }

  return trends;
};

export const getRecentActivity = async (limit = 10) => {
  const transactions = await Transaction.find({ isDeleted: false })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(limit);

  return transactions;
};

export const getPaymentMethodBreakdown = async () => {
  const result = await Transaction.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$paymentMethod",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        paymentMethod: "$_id",
        total: { $round: ["$total", 2] },
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  return result;
};
