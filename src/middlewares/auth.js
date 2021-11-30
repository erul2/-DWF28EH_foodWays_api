const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  verify(req, res, next, false);
};

exports.authPartner = (req, res, next) => {
  verify(req, res, next, true);
};

const verify = (req, res, next, partner) => {
  const authHeader = req.header("Authorization");

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "Access Denied!" });
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_KEY);
    // check user role if not partner send error
    if (partner && verified.role !== "partner") {
      return res.status(401).send({
        status: "failed",
        message: "Access Denied, You are not a partner!",
      });
    }
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send({
      message: "Invalid token",
    });
  }
};
