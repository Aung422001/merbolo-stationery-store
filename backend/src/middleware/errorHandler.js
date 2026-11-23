export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server Error';
  if (statusCode >= 500 && process.env.NODE_ENV !== 'development') message = 'Internal server error';

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: statusCode >= 500 && process.env.NODE_ENV !== 'development' ? [] : err.errors
      ? Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }))
      : []
  });
};
