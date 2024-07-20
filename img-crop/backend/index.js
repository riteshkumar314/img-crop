const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const metadataFilePath = 'imageMetadata.json';

const readMetadata = () => {
  if (!fs.existsSync(metadataFilePath)) {
    return [];
  }
  const data = fs.readFileSync(metadataFilePath);
  return JSON.parse(data);
};

const writeMetadata = (metadata) => {
  fs.writeFileSync(metadataFilePath, JSON.stringify(metadata));
};


app.post('/upload', upload.single('image'), (req, res) => {
  try {
    const imagePath = req.file.path;
    const imageMetadata = readMetadata();

    
    imageMetadata.push({ imagePath });

    writeMetadata(imageMetadata);

    res.status(200).json({ message: 'Image uploaded successfully', imagePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/images', (req, res) => {
  try {
    const imageMetadata = readMetadata();
    res.status(200).json(imageMetadata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
