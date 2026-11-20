// Leonida Legend — entry program for make.fun's gta6-trophy-guide-01 (Node 22, standard library only).
//
// The guide itself is the static web app in app/ (open app/index.html in a desktop browser; it runs fully
// offline). This program hands the entry in: it copies app/ and screenshots/ from beside this file into the
// output directory and writes dossier.json there with buildDossier from the vendored make.fun library —
// vendor/makefun-frontend.ts stays byte for byte the kit's copy, because the scorer rebuilds the dossier
// with its own copy and compares the two.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps for this bounty, passed to the library so an entry the scorer would refuse is refused
// here first: at most 4 screenshots of 256 KiB each, at most 993 files and directories in app/, at most
// 48 MiB of app files, and the dossier text capped at 160 KiB.
const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, DOSSIER_LIMITS));
