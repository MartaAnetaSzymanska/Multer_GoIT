const fs = require("fs").promises;
const Jimp = require("jimp");
const { resolve } = require("path");

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

const isImageAndTransform = async (path) => {
  try {
    const image = await Jimp.read(path); // Promise-based version of Jimp.read

    const w = image.getWidth();
    const h = image.getHeight();
    const cropWidth = w > MAX_AVATAR_WIDTH ? MAX_AVATAR_WIDTH : w;
    const cropHeight = h > MAX_AVATAR_HEIGHT ? MAX_AVATAR_HEIGHT : h;
    const centerX = Math.round(w / 2 - cropWidth / 2);
    const centerY = Math.round(h / 2 - cropHeight / 2);

    await image
      .crop(
        centerX < 0 ? 0 : centerX,
        centerY < 0 ? 0 : centerY,
        cropWidth,
        cropHeight
      )
      .sepia()
      .write(path); // Writing the transformed image

    return true;
  } catch (e) {
    console.error("Error processing image:", e);
    return false;
  }
};
module.exports = { setUpFolder, isImageAndTransform };
