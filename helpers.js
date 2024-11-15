const fs = require("fs").promises;
const { Jimp } = require("jimp");
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

const isImageAndTransform = async (path) =>
  new Promise((resolve) => {
    Jimp.read(path, async (err, image) => {
      if (err) resolve(false);

      try {
        const w = image.getWidth();
        const h = image.getHeight();
        const cropWidth = w > MAX_AVATAR_WIDTH ? MAX_AVATAR_WIDTH : w;
        const cropHeight = h > MAX_AVATAR_HEIGHT ? MAX_AVATAR_HEIGHT : h;
        const centerX = Math.round(w / 2 - cropWidth / 2);
        const centerY = Math.round(h / 2 - cropHeight / 2);

        await image
          // rotate to walidacja, jeśli ktoś przyslalby nam inny plik niz zdjęcie, to nie udałyby się poniższe działania na tym pliku
          .rotate(360)
          .crop(
            centerX < 0 ? 0 : centerX,
            centerY < 0 ? 0 : centerY,
            cropWidth,
            cropHeight
          )
          .sepia()
          .write(path);
        resolve(true);
      } catch (e) {
        console.log(e);
        resolve(false);
      }
    });
  });

module.exports = { setUpFolder, isImageAndTransform };
