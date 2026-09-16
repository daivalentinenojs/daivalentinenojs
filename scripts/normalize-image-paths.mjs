import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profileDirectory = path.join(repositoryRoot, "profile");
const assetBaseUrl =
  "https://raw.githubusercontent.com/daivalentinenojs/.github/main/assets/";
const legacyAssetBaseUrls = [
  "../assets/",
  "https://raw.githubusercontent.com/sophistec-solutions/.github/main/assets/",
];

const readmeFiles = (await readdir(profileDirectory)).filter(
  (file) => file.startsWith("README") && file.endsWith(".md"),
);

let updatedFiles = 0;
let updatedPaths = 0;

for (const file of readmeFiles) {
  const filePath = path.join(profileDirectory, file);
  const source = await readFile(filePath, "utf8");
  const matches = legacyAssetBaseUrls.flatMap(
    (legacyBaseUrl) => source.match(new RegExp(legacyBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? [],
  );

  if (matches.length === 0) continue;

  const normalized = legacyAssetBaseUrls.reduce(
    (content, legacyBaseUrl) => content.replaceAll(legacyBaseUrl, assetBaseUrl),
    source,
  );
  await writeFile(filePath, normalized, "utf8");
  updatedFiles += 1;
  updatedPaths += matches.length;
}

console.log(`Updated ${updatedPaths} image paths in ${updatedFiles} README files.`);
