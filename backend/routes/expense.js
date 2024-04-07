const express = require("express");
const zod = require("zod");
const { Expense } = require("../db");
const { authMiddleware } = require("../middleware");

const expenseRouter = express.Router();

const expenseSchema = zod.object({
  amount: zod.number(),
  description: zod.string(),
});

expenseRouter.post("/add", authMiddleware, async (req, res) => {
  const { success } = expenseSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const expense = await Expense.create({
    userId: req.userId,
    amount: req.body.amount,
    description: req.body.description,
  });

  res.json({
    message: "Expense Added Successfully",
    expense: expense,
  });
});

expenseRouter.get("/all", authMiddleware, async (req, res) => {
  const expenses = await Expense.find({
    userId: req.userId,
  });

  res.json({
    message: "Expense Sent Successfully",
    expenses: expenses,
  });
});

module.exports = {
  expenseRouter,
};
