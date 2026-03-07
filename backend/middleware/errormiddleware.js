const errormiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  console.error("Error:", statusCode, err.message);

  res.status(statusCode).json(response);
};

module.exports = errormiddleware;