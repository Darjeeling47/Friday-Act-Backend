module.exports = async (req, res, next) => {
  try {
    const applicationId = req.params.id;

    const user = req.user;

    if (!applicationId || typeof applicationId == "undefined" || typeof applicationId != "number") {
      return res.status(404).json({
        success: false,
        message: "This application is not found.",
      });
    }

    const application = await knex("APPLICATIONS")
      .where({ id: applicationId })
      .del("*");

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "This application is not found.",
        });
      }


    return res.status(200).json({
      success: true,
      application: {}
    })
  } catch {
    console.log(error);
    return res.status(500).json({ message: "An error occurred.", error: error.message });
  }
};
