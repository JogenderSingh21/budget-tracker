const express = require("express");
const zod = require("zod");
const { Income } = require("../db");
const { authMiddleware } = require("../middleware");

const incomeRouter = express.Router();

const incomeSchema = zod.object({
  amount: zod.number(),
  description: zod.string(),
});

incomeRouter.post("/add", authMiddleware, async (req, res) => {
  const { success } = incomeSchema.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const income = await Income.create({
    userId: req.userId,
    amount: req.body.amount,
    description: req.body.description,
  });

  res.json({
    message: "Income Added Successfully",
    income: income,
  });
});

incomeRouter.get("/all", authMiddleware, async (req, res) => {
  const incomes = await Income.find({
    userId: req.userId,
  });

  res.json({
    message: "Income Sent Successfully",
    incomes: incomes,
  });
});

module.exports = {
  incomeRouter,
};
