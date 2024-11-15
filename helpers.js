const fs = require("fs").promises;

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
module.exports = { setUpFolder };
