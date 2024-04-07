const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User } = require("../db");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const userRouter = express.Router();

const signupSchema = zod.object({
  username: zod.string().email(),
  password: zod.string().min(6),
  fullName: zod.string(),
});

userRouter.post("/signup", async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    const validationResult = signupSchema.safeParse({
      username,
      password,
      fullName,
    });

    console.log(req.body, username, password, fullName);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: validationResult.error,
      });
    }
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const newUser = await User.create({ username, password, fullName });

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);
    console.log("token ban gya");

    res.json({
      message: "User created successfully",
      token,
    });
  } catch (error) {
    console.error("Error in user signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const signinSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

userRouter.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const validationResult = signinSchema.safeParse({
      username,
      password,
    });

    console.log(req.body, username, password);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: validationResult.error,
      });
    }
    const user = await User.findOne({
      username: username,
      password: password,
    });

    if (user) {
      const token = jwt.sign(
        {
          userId: user._id,
        },
        JWT_SECRET
      );
      res.json({
        token: token,
      });
    } else {
      res.status(411).json({
        message: "User Not Found!!",
      });
    }
    console.log("token ban gya");
  } catch (error) {
    console.error("Error in user signin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const forgotSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  updatedPassword: zod.string(),
});

userRouter.post("/forgot", async (req, res) => {
  const { success } = forgotSchema.safeParse(body);

  if (!success) {
    return res.status(411).json({
      message: "Error while logging in",
    });
  }

  try {
    const user = await User.updateOne(
      {
        username: req.body.username,
        password: req.body.password,
      },
      {
        password: req.body.updatedPassword,
      }
    );

    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );

    res.json({
      token: token,
    });
    return;
  } catch (error) {
    res.status(411).json({
      message: "Error while logging in",
    });
  }
});

userRouter.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findOne({
    _id: req.userId,
  });

  res.json({
    username: user.username,
    fullName: user.fullName,
  });
});

module.exports = {
  userRouter,
};
