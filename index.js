const Jimp = require("jimp");
const fs = require("fs").promises;
const express = require("express");
const path = require("path");
const multer = require("multer");
const { v4: uuidV4 } = require("uuid");
const { setUpFolder } = require("./helpers");

const app = express();
// console.log(uuidV4());

app.set("view engine", "ejs");
app.use(express.static(path.resolve(__dirname, "./public")));

const tempDir = path.join(process.cwd(), "temp");
// console.log(tempDir);
const storageImageDir = path.join(process.cwd(), "public/images");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidV4()}${file.originalname}`);
  },
});

const extentionsWhiteList = [".jpg", ".jpeg", ".png", ".gif"];
const mimetypewhiteList = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

const uploadMiddleware = multer({
  storage,
  fileFilter: async (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimetype = path.mimetype;

    // paczka multer wymaga, ze jesli warunek się zgadza, mamy zwrócić false
    if (
      !extentionsWhiteList.includes(extension) ||
      !mimetypewhiteList.includes(mimetype)
    ) {
      return cb(null, false);
    }
    return cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// ENDPOINTS (Multer dodaje własciwość - file do wykorzystania w req)
app.post(
  "/upload",
  uploadMiddleware.single("picture"),
  async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ message: "File isn't a photo" });
    }
    res.json(req.file);
  }
);

// ERROR HANDLING

app.use((req, res, next) => {
  res.status(404).json({ message: "page not found" });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ message: err.message, status: err.status });
});
// ------------//------------------
app.listen(8000, async () => {
  await setUpFolder(tempDir);
  await setUpFolder(storageImageDir);
});
