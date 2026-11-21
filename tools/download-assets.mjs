import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GSTATIC_ORIGIN = 'https://www.gstatic.com/';
const GSTATIC_STARTER_PREFIX = 'aistudio/starter-apps/pelican-campus/';

const GLB_SLUGS = [
  "campus_environment_v3",
  "campus_horizon_arch_v5",
  "campus_landmarks_v2",
  "gradient_canopy_v6",
  "props_and_bridge_v6",
  "trees_v4"
];

async function ensureSingleGlb(slug) {
  const destDir = path.join(ROOT_DIR, 'public', 'assets', 'glb');
  const destPath = path.join(destDir, `${slug}.glb`);
  try {
    const st = await fs.stat(destPath);
    if (st.size > 16) return;
  } catch {
    // Proceed to fetch from GStatic.
  }

  await fs.mkdir(destDir, { recursive: true });
  const gstaticUrl = new URL(`${slug}.glb`, GSTATIC_ORIGIN + GSTATIC_STARTER_PREFIX).href;

  const res = await fetch(gstaticUrl);
  if (!res.ok) {
    throw new Error(`Failed to download ${gstaticUrl} (HTTP ${res.status})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length <= 16) {
    throw new Error(`Downloaded empty buffer from ${gstaticUrl}`);
  }

  await fs.writeFile(destPath, buffer);
  console.log(`[download-assets] Ready public/assets/glb/${slug}.glb (${buffer.length} bytes)`);
}

async function main() {
  await Promise.all(GLB_SLUGS.map((slug) => ensureSingleGlb(slug)));
}

main().catch((err) => {
  console.error('[download-assets] Error:', err);
  process.exit(1);
});
