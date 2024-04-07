const express = require("express");
const { userRouter } = require("./user");
const { incomeRouter } = require("./income");
const { expenseRouter } = require("./expense");

const router = express.Router();

router.use("/user", userRouter);
router.use("/income", incomeRouter);
router.use("/expense", expenseRouter);

module.exports = router;
