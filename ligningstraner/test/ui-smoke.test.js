import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";

const htmlPath = path.resolve(import.meta.dirname, "../index.html");
const appPath = path.resolve(import.meta.dirname, "../app.js");

let importCounter = 0;
let activeDom = null;
let randomSpy = null;

function installDomGlobals(dom){
 Object.defineProperty(globalThis, "window", {
  value: dom.window,
  configurable: true,
 });
 Object.defineProperty(globalThis, "document", {
  value: dom.window.document,
  configurable: true,
 });
 Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
 });
 Object.defineProperty(globalThis, "localStorage", {
  value: dom.window.localStorage,
  configurable: true,
 });
 Object.defineProperty(globalThis, "HTMLElement", {
  value: dom.window.HTMLElement,
  configurable: true,
 });
 Object.defineProperty(globalThis, "Node", {
  value: dom.window.Node,
  configurable: true,
 });
 Object.defineProperty(globalThis, "Event", {
  value: dom.window.Event,
  configurable: true,
 });
 Object.defineProperty(globalThis, "KeyboardEvent", {
  value: dom.window.KeyboardEvent,
  configurable: true,
 });

 dom.window.HTMLElement.prototype.scrollIntoView = vi.fn();
}

async function loadApp(randomSequence){
 const html = await fs.readFile(htmlPath, "utf8");
 activeDom = new JSDOM(html, { url: "http://localhost" });
 installDomGlobals(activeDom);

 let idx = 0;
 const fallback = randomSequence[randomSequence.length - 1] ?? 0.5;
 randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
  const value = idx < randomSequence.length ? randomSequence[idx] : fallback;
  idx += 1;
  return value;
 });

 importCounter += 1;
 await import(pathToFileURL(appPath).href + `?test=${importCounter}`);
 return activeDom.window.document;
}

afterEach(() => {
 if(randomSpy){
  randomSpy.mockRestore();
  randomSpy = null;
 }
 if(activeDom){
  activeDom.window.close();
  activeDom = null;
 }

 delete globalThis.window;
 delete globalThis.document;
 delete globalThis.navigator;
 delete globalThis.localStorage;
 delete globalThis.HTMLElement;
 delete globalThis.Node;
 delete globalThis.Event;
 delete globalThis.KeyboardEvent;
});

describe("ui smoke regressions", () => {
 it("keeps the original expert equation in the top box after a step", async () => {
  const document = await loadApp([0.2, 0.4, 0.3, 0.5, 0.55, 0.3, 0.95, 0.7]);

  const modeSelect = document.getElementById("modeSelect");
  modeSelect.value = "expert";
  modeSelect.dispatchEvent(new Event("change"));

  const eqBox = document.getElementById("eqBox");
  const originalEquation = eqBox.textContent;

  const expertCard = document.querySelector(".expertStepCard");
  const expertInput = expertCard.querySelector("input");
  const expertButton = expertCard.querySelector("button");

  expertInput.value = "+1";
  expertButton.click();

  expect(eqBox.textContent).toBe(originalEquation);
  expect(expertCard.querySelector(".boxTask").textContent).not.toBe(originalEquation);
 });

 it("enables step3 button after a valid guided step2 result", async () => {
  const document = await loadApp([0.65, 0.4, 0.65, 0.7]);

  document.getElementById("inputStep1").value = "+1x";
  document.getElementById("btnStep1").click();

  document.getElementById("inputStep2").value = "-3";
  document.getElementById("btnStep2").click();

  expect(document.getElementById("btnStep3").disabled).toBe(false);
 });

 it("does not mark the reported expert case as solved after the -9 step", async () => {
  const document = await loadApp([0.2, 0.4, 0.3, 0.5, 0.55, 0.3, 0.95, 0.7]);

  const modeSelect = document.getElementById("modeSelect");
  modeSelect.value = "expert";
  modeSelect.dispatchEvent(new Event("change"));

  const expertCard = document.querySelector(".expertStepCard");
  const expertInput = expertCard.querySelector("input");
  const expertButton = expertCard.querySelector("button");

  expertInput.value = "-9";
  expertButton.click();

  expect(expertCard.querySelector(".expertResultBox").classList.contains("hidden")).toBe(true);
  expect(expertCard.textContent).not.toContain("Check løsning");
 });
});
