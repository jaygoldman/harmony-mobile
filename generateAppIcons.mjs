#!/usr/bin/env node

/**
 * Generate default, dark, and tinted iOS app icon PNGs from the master SVG.
 */
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { Resvg } from "@resvg/resvg-js";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname);

const MASTER_SVG_PATH = path.join(
  PROJECT_ROOT,
  "assets",
  "images",
  "brand",
  "conductor-mobile-icon.svg",
);

const KNOCKOUT_SVG_PATH = path.join(
  PROJECT_ROOT,
  "assets",
  "images",
  "brand",
  "conductor-mobile-icon-knockout.svg",
);

const OUTPUT_ROOT = path.join(PROJECT_ROOT, "assets", "app-icons");
const SOURCE_OUTPUT = path.join(OUTPUT_ROOT, "source");
const IOS_DEFAULT_OUTPUT = path.join(OUTPUT_ROOT, "ios", "default");
const IOS_DARK_OUTPUT = path.join(OUTPUT_ROOT, "ios", "dark");
const IOS_TINTED_OUTPUT = path.join(OUTPUT_ROOT, "ios", "tinted");

const IOS_EXPORT_SIZES = [
  1024,
  192,
  180,
  167,
  152,
  136,
  128,
  120,
  114,
  87,
  80,
  76,
  60,
  58,
  40,
  29,
  20,
];

const APPEARANCES = [
  { name: "default", renderSvg: (master, tinted, dark) => master },
  { name: "tinted", renderSvg: (master, tinted, dark) => tinted },
  { name: "dark", renderSvg: (master, tinted, dark) => dark },
];

function iconFilename(appearance, pixels) {
  return `icon-${appearance}-${pixels}x${pixels}.png`;
}

function parseSvg(svg) {
  return new DOMParser().parseFromString(svg, "image/svg+xml");
}

function serialize(doc) {
  return new XMLSerializer().serializeToString(doc);
}

function deriveTintedSvg(svgString) {
  const document = parseSvg(svgString);
  const svg = document.documentElement;

  // Remove the background layer and bitmap reference.
  const groups = Array.from(document.getElementsByTagName("g"));
  const layer3 = groups.find((group) => group.getAttribute("id") === "Layer_3");
  if (layer3 && layer3.parentNode) {
    layer3.parentNode.removeChild(layer3);
  }

  // Strip gradients/styles but keep clip paths to preserve silhouettes.
  const defsNodes = Array.from(document.getElementsByTagName("defs"));
  for (const defs of defsNodes) {
    const toRemove = [];
    for (let child = defs.firstChild; child; child = child.nextSibling) {
      if (
        child.nodeType === 1 &&
        (child.nodeName === "style" || child.nodeName === "linearGradient")
      ) {
        toRemove.push(child);
      }
    }
    for (const node of toRemove) {
      defs.removeChild(node);
    }
  }

  // Force remaining shapes into a white fill so the system can tint them.
  const shapeTags = ["polygon", "path", "rect", "circle", "ellipse", "polyline"];
  for (const tag of shapeTags) {
    const elements = Array.from(document.getElementsByTagName(tag));
    for (const element of elements) {
      element.removeAttribute("class");
      element.removeAttribute("style");
      element.setAttribute("fill", "#ffffff");
    }
  }

  // Remove class/style metadata from groups as well.
  for (const group of groups) {
    group.removeAttribute("class");
    group.removeAttribute("style");
  }

  svg.setAttribute("style", "background:none");

  // Remove empty <defs> nodes that no longer contain content.
  for (const defs of defsNodes) {
    if (!defs.firstChild) {
      defs.parentNode.removeChild(defs);
    }
  }

  return serialize(document);
}

function deriveDarkSvg(tintedSvgString) {
  const document = parseSvg(tintedSvgString);
  const svg = document.documentElement;

  let defs = document.getElementsByTagName("defs")[0];
  if (!defs) {
    defs = document.createElement("defs");
    svg.insertBefore(defs, svg.firstChild);
  }

  const gradient = document.createElement("linearGradient");
  gradient.setAttribute("id", "dark-gradient");
  gradient.setAttribute("x1", "0");
  gradient.setAttribute("y1", "0");
  gradient.setAttribute("x2", "0");
  gradient.setAttribute("y2", "1024");
  gradient.setAttribute("gradientUnits", "userSpaceOnUse");

  const stopTop = document.createElement("stop");
  stopTop.setAttribute("offset", "0%");
  stopTop.setAttribute("stop-color", "#120824");

  const stopBottom = document.createElement("stop");
  stopBottom.setAttribute("offset", "100%");
  stopBottom.setAttribute("stop-color", "#093e4b");

  gradient.appendChild(stopTop);
  gradient.appendChild(stopBottom);
  defs.appendChild(gradient);

  const backgroundRect = document.createElement("rect");
  backgroundRect.setAttribute("width", "1024");
  backgroundRect.setAttribute("height", "1024");
  backgroundRect.setAttribute("fill", "url(#dark-gradient)");

  svg.insertBefore(backgroundRect, svg.firstChild);
  return serialize(document);
}

function renderToPng(svgString, pixels) {
  const resvg = new Resvg(Buffer.from(svgString, "utf8"), {
    fitTo: { mode: "width", value: pixels },
  });

  const rendered = resvg.render();
  return rendered.asPng();
}

async function ensureOutputFolders() {
  await Promise.all([
    mkdir(SOURCE_OUTPUT, { recursive: true }),
    mkdir(IOS_DEFAULT_OUTPUT, { recursive: true }),
    mkdir(IOS_DARK_OUTPUT, { recursive: true }),
    mkdir(IOS_TINTED_OUTPUT, { recursive: true }),
  ]);
}

async function main() {
  await ensureOutputFolders();

  const masterSvg = await readFile(MASTER_SVG_PATH, "utf8");
  const knockoutSvg = await readFile(KNOCKOUT_SVG_PATH, "utf8");

  const tintedSvg = deriveTintedSvg(knockoutSvg);
  const darkSvg = deriveDarkSvg(tintedSvg);

  await Promise.all([
    writeFile(path.join(SOURCE_OUTPUT, "conductor-mobile-icon-master.svg"), masterSvg, "utf8"),
    writeFile(path.join(SOURCE_OUTPUT, "conductor-mobile-icon-knockout.svg"), knockoutSvg, "utf8"),
    writeFile(path.join(SOURCE_OUTPUT, "conductor-mobile-icon-tinted.svg"), tintedSvg, "utf8"),
    writeFile(path.join(SOURCE_OUTPUT, "conductor-mobile-icon-dark.svg"), darkSvg, "utf8"),
  ]);

  for (const pixels of IOS_EXPORT_SIZES) {
    await Promise.all(
      APPEARANCES.map(({ name, renderSvg }) => {
        const svg = renderSvg(masterSvg, tintedSvg, darkSvg);
        const png = renderToPng(svg, pixels);
        const outputDir =
          name === "default"
            ? IOS_DEFAULT_OUTPUT
            : name === "tinted"
              ? IOS_TINTED_OUTPUT
              : IOS_DARK_OUTPUT;
        const filename = iconFilename(name, pixels);
        return writeFile(path.join(outputDir, filename), png);
      }),
    );
  }

  console.log("iOS app icon assets generated in", path.relative(PROJECT_ROOT, OUTPUT_ROOT));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
