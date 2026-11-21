import multer from 'multer';

export function notFound(req, res) { res.status(404).json({ message: 'Route not found.' }); }
export function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'Each resume must be 5 MB or smaller.' : err.message });
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join('; ') });
  if (err.code === 11000) return res.status(409).json({ message: 'A record with this identifier already exists.' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid resource identifier.' });
  console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Unexpected server error.' });
}
