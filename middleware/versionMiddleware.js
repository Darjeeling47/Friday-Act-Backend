versionMiddleware = function(version) {
  return function(req, res, next) {
    let requestVersion = parseInt(req.params.version.substring(1)); // removes the "v" and turns into a number
    if (typeof requestVersion !== 'number') {
      return next(new Error("Invalid API version requested."));
    } else if (requestVersion >= version) {
      return next();
    }
    return next("route"); // skip to the next route
  };
};
module.exports = versionMiddleware;