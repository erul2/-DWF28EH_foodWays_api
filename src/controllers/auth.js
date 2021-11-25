// import model
const { user } = require("../../models");

// import joi validation
const Joi = require("joi");
// import bcrypt
const bcrypt = require("bcrypt");
// import jsonwebtoken
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  // validation schema
  const schema = Joi.object({
    email: Joi.string().required(),
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
    const token = jwt.sign({ id: userExist.id }, process.env.TOKEN_KEY);

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
