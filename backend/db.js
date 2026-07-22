// db.js
// Minimal "JSON file as database" layer.
// Reads/writes plain JSON files under ./data — no external DB engine needed.
// Good enough for a prototype; swap for a real DB (Postgres/Mongo) before production.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

function filePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection(collection) {
  const file = filePath(collection);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf-8");
  return raw.trim() ? JSON.parse(raw) : [];
}

function writeCollection(collection, data) {
  const file = filePath(collection);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

function nextId(collection, prefix) {
  const items = readCollection(collection);
  const nums = items
    .map((i) => parseInt(String(i.id).replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

module.exports = { readCollection, writeCollection, nextId, filePath };
