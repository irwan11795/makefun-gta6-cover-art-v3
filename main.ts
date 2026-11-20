// Vice Cover Studio v4.4 — the entry program (Node 22, standard library only).
// It hands the app in: copies this repository's app/ and screenshots/ into the
// output directory and writes the dossier.json the judge reads, using the
// vendored make.fun library. Outside the grader, MAKEFUN_OUTPUT_DIR stands
// in for /output, so a local check is:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The program is deterministic: the same repository writes the same bytes on
// every run, so the grader's two runs agree byte for byte.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The repository root: the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

// Where the entry goes: the grader's /output, or the local stand-in.
const targetDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(targetDir, { recursive: true });

  // The app itself: every static file under app/.
  cpSync(join(repoRoot, 'app'), join(targetDir, 'app'), { recursive: true });

  // The screenshots: 3 or 4 renders, the first by name the cover.
  mkdirSync(join(targetDir, 'screenshots'), { recursive: true });
  const shotsDir = join(repoRoot, 'screenshots');
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(targetDir, 'screenshots'), { recursive: true });
  }

  // The dossier: the scorer's caps, so this program refuses exactly where
  // the scorer would — a screenshot over 256 KiB, more than 4 of them, an
  // app over 993 entries or 48 MiB, a path over 1000 bytes.
  const dossier = buildDossier(targetDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(targetDir, 'dossier.json'), dossier);
  const shotNames = readdirSync(join(targetDir, 'screenshots'));
  console.log(`Vice Cover Studio v4.4 handed in to ${targetDir} (${shotNames.length} screenshots, dossier ${dossier.length} bytes)`);
}

handIn();
