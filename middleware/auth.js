require("../utils/getStudentData");
const { getUserInfoFromToken } = require("../utils/getUserInfoFromToken");

exports.protect = async (req, res, next) => {
  try {
    let token;

    //Check if header is valid and have Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    //Check if token is exits
    if (!token || token == "null" || token === undefined) {
      return res.status(401).json({
        success: false,
        message:
          "This user account don't have permission to access this function.",
      });
    }

    const userData = await getUserInfoFromToken(token);

    if (!userData) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = userData;

    next();
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
};

exports.authorize = (role) => {
  return (req, res, next) => {
    //Check if this role have permission to access this route
    if ( !req.user.isApplicationAdmin ) {
      return res.status(403).json({
        success: false,
        message:
          "This user account don't have permission to access this function.",
      });
    }

    next();
  };
};

exports.gate = async (req, res, next) => {
  try{
    let token;

    //Check if header is valid and have Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    //Check if token is exits
    if (token && token != "null" && token != undefined) {
      const userData = await getUserInfoFromToken(token);

      req.user = userData;

      next();
    }
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
};
