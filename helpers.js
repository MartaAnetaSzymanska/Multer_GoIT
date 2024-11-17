const fs = require("fs").promises;
const sharp = require("sharp");
const path = require("path");

// sprawdzamy czy folder istnieje, jesli nie to tworzymy go:
const isAccessible = (path) =>
  fs
    .access(path)
    .then(() => true)
    .catch(() => false);

const setUpFolder = async (path) => {
  const folderExist = await isAccessible(path);
  console.log(folderExist);

  if (!folderExist) {
    try {
      await fs.mkdir(path);
    } catch (e) {
      console.log("No permissions");
      process.exit(1);
    }
  }
};

const MAX_AVATAR_WIDTH = 512;
const MAX_AVATAR_HEIGHT = 512;

const isImageAndTransform = async (filePath) => {
  try {
    const image = sharp(filePath);

    const metadata = await image.metadata();

    const w = metadata.width;
    const h = metadata.height;

    const cropWidth = w > MAX_AVATAR_WIDTH ? MAX_AVATAR_WIDTH : w;
    const cropHeight = h > MAX_AVATAR_HEIGHT ? MAX_AVATAR_HEIGHT : h;

    const centerX = Math.round(w / 2 - cropWidth / 2);
    const centerY = Math.round(h / 2 - cropHeight / 2);

    const tempOutputPath = path.join(
      path.dirname(filePath),
      `temp-${path.basename(filePath)}`
    );

    await image
      .resize(cropWidth, cropHeight)
      .extract({
        left: centerX,
        top: centerY,
        width: cropWidth,
        height: cropHeight,
      })
      .rotate(360)
      .toFile(tempOutputPath);

    await fs.rename(tempOutputPath, filePath);

    console.log("Image processed successfully");
    return true;
  } catch (err) {
    console.log("Error during image processing:", err);
    return false;
  }
};

module.exports = { setUpFolder, isImageAndTransform };
