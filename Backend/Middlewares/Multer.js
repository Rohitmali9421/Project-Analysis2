import multer from 'multer';

// Use in-memory storage (no disk write)
const storage = multer.memoryStorage();

const upload = multer({ storage });

const uploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('file');

  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Access the file buffer via req.file.buffer
    req.body.fileBuffer = req.file.buffer;
    req.body.fileName = req.file.originalname;

    next();
  });
};

export default uploadMiddleware;
