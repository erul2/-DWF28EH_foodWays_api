const { user, profile } = require("../../models");

exports.getUsers = async (req, res) => {
  try {
    const users = await user.findAll({
      include: {
        model: profile,
        as: "profile",
        attributes: {
          exclude: ["id", "createdAt", "updatedAt", "idUser"],
        },
      },
      attributes: {
        exclude: ["password", "createdAt", "updatedAt", "idUser"],
      },
    });

    const userData = await users.map((user) => {
      let image = null;
      let location = null;
      if (user.profile) {
        location = user.profile.location;
        image = user.profile.image;
      }
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location,
        image,
        role: user.role,
      };
    });

    res.send({
      status: "success",
      data: { users: userData },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userExist = await user.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!userExist) {
      return res.status(400).send({
        status: "failed",
        message: "user not found",
      });
    }
    await user.destroy({
      where: { id },
    });

    res.send({
      status: "success",
      data: {
        id,
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
