import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cacheDirectory = resolve(__dirname, "../data/cache");

const cacheFiles = {
  programs: resolve(cacheDirectory, "programs.json"),
};

const inMemoryCache = new Map();

function createEmptyCacheEntry() {
  return {
    found: false,
    items: [],
    updatedAt: "",
  };
}

function normalizeCacheEntry(payload) {
  return {
    found: true,
    items: Array.isArray(payload?.items) ? payload.items : [],
    updatedAt: typeof payload?.updatedAt === "string" ? payload.updatedAt : "",
  };
}

async function ensureCacheDirectory() {
  await mkdir(cacheDirectory, { recursive: true });
}

export async function readCachedCollection(collectionName) {
  if (inMemoryCache.has(collectionName)) {
    return inMemoryCache.get(collectionName);
  }

  const filePath = cacheFiles[collectionName];

  if (!filePath) {
    return createEmptyCacheEntry();
  }

  try {
    const raw = await readFile(filePath, "utf8");
    const cacheEntry = normalizeCacheEntry(JSON.parse(raw));
    inMemoryCache.set(collectionName, cacheEntry);
    return cacheEntry;
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.error(`Failed to read ${collectionName} cache:`, error);
    }

    return createEmptyCacheEntry();
  }
}

export async function writeCachedCollection(collectionName, items) {
  const filePath = cacheFiles[collectionName];

  if (!filePath) {
    return createEmptyCacheEntry();
  }

  const cacheEntry = {
    found: true,
    items: Array.isArray(items) ? items : [],
    updatedAt: new Date().toISOString(),
  };

  inMemoryCache.set(collectionName, cacheEntry);

  try {
    await ensureCacheDirectory();
    await writeFile(filePath, JSON.stringify(cacheEntry, null, 2), "utf8");
  } catch (error) {
    console.error(`Failed to write ${collectionName} cache:`, error);
  }

  return cacheEntry;
}
