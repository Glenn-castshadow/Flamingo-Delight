// Generates the homepage art with Higgsfield. Skips anything already downloaded.
// Run: node --env-file=C:/Working_Projects/Homelab_Design/.env.local generate.ts
// Raw PNGs land in assets/_raw; `npm run shrink` turns them into web JPGs in assets/.
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { config, higgsfield } from "@higgsfield/client/v2";

if (!process.env.HF_CREDENTIALS) throw new Error("HF_CREDENTIALS not set");
config({ credentials: process.env.HF_CREDENTIALS });

const MODEL = "higgsfield-ai/soul/v2/standard";
const LOOK =
  "1960s Kodachrome slide photograph, Palm Springs, hard desert sunlight, crisp shadows, saturated flamingo pink and swimming-pool turquoise, slight film grain, photorealistic, no text, no letters, no logos, no watermark";
const PRODUCT =
  "product still life photograph, soft even daylight, gentle shadow, sharp focus, photorealistic, no text, no letters, no labels, no logos, no watermark";

// The collage matches Glenn's moodboard: brighter and more saturated than the Kodachrome set.
const SUNNY =
  "bright sunny pastel editorial travel photograph, Palm Springs, saturated candy pink, aqua and sunshine yellow, crisp midday sun, clear blue sky, no people, photorealistic, no text, no letters, no signs, no logos, no watermark";

const img = (aspect_ratio: string, prompt: string) =>
  ({ aspect_ratio, resolution: "1080p", batch_size: 1, enhance_prompt: false, prompt });

const JOBS: { file: string; input: Record<string, unknown> }[] = [
  { file: "hero.png", input: img("3:4", `Three pink plastic lawn flamingos standing on a neat green lawn in front of a white breeze-block screen wall with a four-petal cut-out pattern, the curved edge of a turquoise kidney-shaped swimming pool in the foreground, one tall fan palm, bare brown desert mountains behind under a deep blue cloudless sky. ${LOOK}`) },
  { file: "collage-loungers.png", input: img("4:3", `A row of sun loungers with pink and white striped cushions beside a bright aqua swimming pool, tall palm trees, pink desert mountains behind. ${SUNNY}`) },
  { file: "collage-cactus.png", input: img("3:4", `Pale stone steps rising through a lush cactus garden of golden barrel cactus and tall saguaro among desert boulders, up to a pale pink flat-roofed modernist house with a mint green front door. ${SUNNY}`) },
  { file: "collage-arches.png", input: img("16:9", `A pink stucco arcade of tall rounded arches around a still aqua pool, the inside of each arch painted sunshine yellow, a curved pink built-in sofa with round yellow cushions, palm fronds in the corner. ${SUNNY}`) },
  { file: "shop-swizzle.png", input: img("1:1", `A tall cocktail glass of pale pink drink with ice holding four pink plastic swizzle sticks each topped with a small flamingo, standing on a cream terrazzo countertop flecked with pink and green chips, pastel pink wall behind. ${PRODUCT}`) },
  { file: "shop-coasters.png", input: img("1:1", `A short stack of four round terrazzo coasters, cream stone with pink, turquoise and gold chips, one coaster lying flat beside the stack, on a pale pink laminate tabletop. ${PRODUCT}`) },
  // A bookends version came back with garbled lettering on the book spines; a planter has nothing to letter.
  { file: "shop-planter.png", input: img("1:1", `A small square white glazed ceramic planter shaped like a mid-century breeze block, its sides pierced with a four-petal cut-out pattern, holding one round golden barrel cactus, standing on a pale pink shelf against a turquoise wall. ${PRODUCT}`) },
  { file: "shop-keyfob.png", input: img("1:1", `Three vintage diamond-shaped plastic motel key fobs in pink, turquoise and butter yellow, completely blank with no printing, each on a small brass ring with an old brass door key, lying on white terrazzo. ${PRODUCT}`) },
  { file: "story-bathroom.png", input: img("4:3", `A 1958 bathroom tiled floor to ceiling in pale pink square ceramic tile with one black tile trim band, a pink bathtub, pink pedestal sink and pink toilet, chrome taps, a small frosted window letting in bright daylight, a fluffy pink bath mat. ${LOOK}`) },
  { file: "story-tree.png", input: img("4:3", `A silver aluminum tinsel Christmas tree in a 1962 living room at night, lit by a rotating color wheel floor lamp throwing pink, turquoise and amber light across the silver branches, a low walnut sofa, a shag rug, sliding glass doors to a dark patio. 1960s Kodachrome slide photograph, film grain, photorealistic, no text, no letters, no logos, no watermark`) },
  { file: "story-sign.png", input: img("4:3", `A tall googie roadside motel sign at dusk against a pink and orange desert sky: a boomerang-shaped arm, a starburst on top, a big arrow outlined in light bulbs, neon tubing glowing pink and turquoise, the sign panels completely blank and empty with no letters, two palm tree silhouettes. 1960s Kodachrome slide photograph, film grain, photorealistic, absolutely no text, no letters, no words, no numbers, no logos anywhere`) },
];

await mkdir("assets/_raw", { recursive: true });

for (const { file, input } of JOBS) {
  const out = `assets/_raw/${file}`;
  if (existsSync(out)) { console.log(`skip ${file}`); continue; }
  console.log(`generating ${file}…`);
  const result = await higgsfield.subscribe(MODEL, { input, withPolling: true });
  // Response shape differs per model, so take the first media URL we can find.
  const url = JSON.stringify(result).match(/https:[^"]+\.(?:png|jpe?g|webp)/)?.[0];
  if (!url) { console.error(`no image for ${file}:`, JSON.stringify(result).slice(0, 300)); continue; }
  await writeFile(out, Buffer.from(await (await fetch(url)).arrayBuffer()));
  console.log(`saved ${file}`);
}
