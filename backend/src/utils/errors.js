class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

function errorMiddleware(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error('Unexpected error', err);
  return res.status(500).json({ message: 'Error interno del servidor' });
}

module.exports = {
  AppError,
  asyncHandler,
  errorMiddleware
};
