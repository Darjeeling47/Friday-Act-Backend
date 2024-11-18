const knex = require("knex")(require("../../../knexfile").development);

module.exports = async (req, res, next) => {
  try {
    const applicationId = req.params.id;

    if (!applicationId || typeof applicationId == "undefined" || typeof applicationId != "string") {
      return res.status(404).json({
        success: false,
        message: "This application is not found.",
      });
    }

    const application = await knex("APPLICATIONS")
      .where({ id: applicationId })
      .del("*");

    console.log(application);

      if (!application || application.length === 0) {
        return res.status(404).json({
          success: false,
          message: "This application is not found.",
        });
      }


    return res.status(200).json({
      success: true,
      application: {}
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred.", error: error.message });
  }
};
