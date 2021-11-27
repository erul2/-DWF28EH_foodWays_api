// import model
const { user } = require("../../models");

// import joi validation
const Joi = require("joi");
// import bcrypt
const bcrypt = require("bcrypt");
// import jsonwebtoken
const jwt = require("jsonwebtoken");

// Controller Login
exports.login = async (req, res) => {
  // validation schema
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  // do validation and get error object fro schema.validate
  const { error } = schema.validate(req.body);

  // if error send validation error message and
  if (error) {
    return res.status(400).send({
      error: {
        message: error.details[0].message,
      },
    });
  }
  try {
    const userExist = await user.findOne({
      where: {
        email: req.body.email,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    // if user not found send respone
    if (!userExist) {
      return res.status(400).send({
        status: "failed",
        message: "User Not Found",
      });
    }

    // compare password between entered from client and from databse
    const isValid = await bcrypt.compare(req.body.password, userExist.password);

    // check if not valid then return response with status 400 (bad request)
    if (!isValid) {
      return res.status(400).send({
        status: "failed",
        message: "Email or Password is invalid",
      });
    }

    // generate token
    const token = jwt.sign(
      {
        id: userExist.id,
        role: userExist.role,
      },
      process.env.TOKEN_KEY
    );

    res.status(200).send({
      status: "success",
      data: {
        user: {
          fullName: userExist.fullName,
          email: userExist.email,
          token,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};

// Controller Register
exports.register = async (req, res) => {
  const { email, password, fullName, gender, phone, role } = req.body;
  // validation schema
  const schema = Joi.object({
    email: Joi.string().email().min(6).required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(3).required(),
    gender: Joi.string().min(4),
    phone: Joi.string().min(8),
    role: Joi.string().min(4).required(),
  });

  // do validation
  const { error } = schema.validate(req.body);

  // if error send validation error message
  if (error) {
    return res.status(400).send({
      error: { message: error.details[0].message },
    });
  }

  try {
    // check if email aleready exists
    const userExist = await user.findOne({
      where: {
        email: req.body.email,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (userExist) {
      return res.status(400).send({
        status: "failed",
        message: "User aleready exists",
      });
    }

    // generate salt
    const salt = await bcrypt.genSalt(10);
    // hashing password from request body
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await user.create({
      email,
      password: hashedPassword,
      fullName,
      gender,
      phone,
      role,
    });

    // generate token
    const token = jwt.sign(
      {
        id: newUser.id,
        role: newUser.role,
      },
      process.env.TOKEN_KEY
    );

    res.status(200).send({
      status: "success",
      data: {
        user: {
          fullName: newUser.fullName,
          token,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};
