const { getCompanies } = require("../../../utils/getCompanies");

module.exports = async (req, res, next) => {
  try {

    const {search, limit, page} = req.query;
    let filterParams = {};
    if (search) {
      filterParams.search = search
    }
    if (limit) {
      filterParams.limit = limit
    }
    if (page) {
      filterParams.page = page
    }

    const companyObjArray = await getCompanies(filterParams)

    if (!companyObjArray) throw new Error(`getCompaniesV1, Error at getCompanies using filter parameters of ${Object.entries(filterParams)}`)

    return res.status(200).json({
      success: true,
      company: companyObjArray
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred.",
    });
  }
}