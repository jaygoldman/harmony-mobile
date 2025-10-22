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
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

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

const IOS_EXPORTS = [
  { pixels: 1024, filename: "Icon-App-1024x1024@1x.png" },
  { pixels: 180, filename: "Icon-App-60x60@3x.png" },
  { pixels: 167, filename: "Icon-App-83.5x83.5@2x~ipad.png" },
  { pixels: 152, filename: "Icon-App-76x76@2x~ipad.png" },
  { pixels: 120, filename: "Icon-App-60x60@2x.png" },
  { pixels: 120, filename: "Icon-App-40x40@3x.png" },
  { pixels: 120, filename: "Icon-App-60x60@2x~ipad.png" },
  { pixels: 87, filename: "Icon-App-29x29@3x.png" },
  { pixels: 80, filename: "Icon-App-40x40@2x.png" },
  { pixels: 80, filename: "Icon-App-40x40@2x~ipad.png" },
  { pixels: 76, filename: "Icon-App-76x76@1x~ipad.png" },
  { pixels: 60, filename: "Icon-App-20x20@3x.png" },
  { pixels: 58, filename: "Icon-App-29x29@2x.png" },
  { pixels: 58, filename: "Icon-App-29x29@2x~ipad.png" },
  { pixels: 40, filename: "Icon-App-20x20@2x.png" },
  { pixels: 40, filename: "Icon-App-20x20@2x~ipad.png" },
  { pixels: 40, filename: "Icon-App-40x40@1x~ipad.png" },
  { pixels: 29, filename: "Icon-App-29x29@1x~ipad.png" },
  { pixels: 20, filename: "Icon-App-20x20@1x~ipad.png" },
];

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

  for (const spec of IOS_EXPORTS) {
    const defaultPng = renderToPng(masterSvg, spec.pixels);
    const tintedPng = renderToPng(tintedSvg, spec.pixels);
    const darkPng = renderToPng(darkSvg, spec.pixels);

    await Promise.all([
      writeFile(path.join(IOS_DEFAULT_OUTPUT, spec.filename), defaultPng),
      writeFile(
        path.join(IOS_TINTED_OUTPUT, spec.filename.replace(".png", "~tinted.png")),
        tintedPng,
      ),
      writeFile(
        path.join(IOS_DARK_OUTPUT, spec.filename.replace(".png", "~dark.png")),
        darkPng,
      ),
    ]);
  }

  console.log("iOS app icon assets generated in", path.relative(PROJECT_ROOT, OUTPUT_ROOT));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
