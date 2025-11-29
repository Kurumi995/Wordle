export const errorHandler = (err, req, res, next) => {
  console.error('Error details:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString()
  });
};

