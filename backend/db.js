const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://yadavvarsha0012:5yUvWAtgHvz56YPo@cluster0.przpzic.mongodb.net/Expense-Tracker"
);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
});

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
const Income = mongoose.model("Income", incomeSchema);
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = {
  User,
  Income,
  Expense,
};
