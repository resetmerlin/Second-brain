import ForceGraph3D from "3d-force-graph";
import { Graph } from "scriptmind-second-brain";

import app from "./directories.json";
import files from "./notes.json";

let params = new URLSearchParams(document.location.search);
let graphId = params.get("graph");

const rootGraph = Graph.createFromApp(app[0], files);

console.log(graphId);

const graph = graphId
  ? rootGraph.getLocalGraph(graphId).clone()
  : rootGraph.clone();

const forceGraph = ForceGraph3D()(document.getElementById("second-brain"))
  .graphData(graph)
  .nodeLabel((node) => {
    const textColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--text-normal")
      .trim();
    return `<div style="color: ${textColor};">${node.name}</div>`;
  })
  .nodeRelSize(3)
  .backgroundColor("white")
  .width(window.innerWidth)
  .height(window.innerHeight)
  .nodeColor(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim()
  )
  .linkColor(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--background-secondary")
      .trim()
  )
  .linkWidth(1)
  .onNodeClick((node) => {
    console.log(node);
    // Navigate to the node's graph ID without reloading the page
    if (node.id) {
      const url = new URL(`${window.location}graph`);
      url.searchParams.set("graph", node.id);
      window.history.pushState({}, "", url.toString());
    }
  });

new ObsidianTheme(document.getElementById("second-brain"));

// Helper to access the current theme in TS
export class ObsidianTheme {
  backgroundPrimary;
  backgroundPrimaryAlt;
  backgroundSecondary;
  backgroundSecondaryAlt;

  backgroundModifierBorder;
  backgroundModifierSuccess;
  backgroundModifierError;

  colorAccent;
  interactiveAccentHover;

  textNormal;
  textMuted;
  textFaint;

  textAccent;

  // some others missing, but not needed currently

  constructor(root) {
    this.backgroundPrimary = getComputedStyle(root)
      .getPropertyValue("--background-primary")
      .trim();
    this.backgroundPrimaryAlt = getComputedStyle(root)
      .getPropertyValue("--background-primary-alt")
      .trim();
    this.backgroundSecondary = getComputedStyle(root)
      .getPropertyValue("--background-secondary")
      .trim();
    this.backgroundSecondaryAlt = getComputedStyle(root)
      .getPropertyValue("--background-secondary-alt")
      .trim();

    this.backgroundModifierBorder = getComputedStyle(root)
      .getPropertyValue("--background-modifier-border")
      .trim();
    this.backgroundModifierSuccess = getComputedStyle(root)
      .getPropertyValue("--background-modifier-success")
      .trim();
    this.backgroundModifierError = getComputedStyle(root)
      .getPropertyValue("--background-modifier-error")
      .trim();

    this.colorAccent = getComputedStyle(root)
      .getPropertyValue("--color-accent")
      .trim();

    this.textNormal = getComputedStyle(root)
      .getPropertyValue("--text-normal")
      .trim();
    this.textMuted = getComputedStyle(root)
      .getPropertyValue("--text-muted")
      .trim();
    this.textFaint = getComputedStyle(root)
      .getPropertyValue("--text-faint")
      .trim();

    this.textAccent = getComputedStyle(root)
      .getPropertyValue("--text-accent")
      .trim();
    this.interactiveAccentHover = getComputedStyle(root)
      .getPropertyValue("--interactive-accent-hover")
      .trim();
  }
}
