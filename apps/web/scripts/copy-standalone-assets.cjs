const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const standaloneApp = path.join(root, ".next", "standalone", "apps", "web");

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) return;
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}

if (!fs.existsSync(standaloneApp)) {
  process.exit(0);
}

copyDirectory(path.join(root, ".next", "static"), path.join(standaloneApp, ".next", "static"));
copyDirectory(path.join(root, "public"), path.join(standaloneApp, "public"));
