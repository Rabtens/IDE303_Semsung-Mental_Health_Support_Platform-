const fs = require('fs');
const path = require('path');

function createJsonStore(dataDir, fileName) {
  const filePath = path.join(dataDir, fileName);

  function ensureFile() {
    fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}));
    }
  }

  function read() {
    ensureFile();
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return {};
    }
  }

  function write(data) {
    ensureFile();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  return { filePath, read, write };
}

module.exports = { createJsonStore };
