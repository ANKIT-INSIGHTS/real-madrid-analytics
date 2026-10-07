import assert from "node:assert/strict";
import test from "node:test";
import { getPlayerChartLabel } from "../src/playerNames.js";

test("uses a surname when it uniquely identifies a player", () => {
  const names = ["Kylian Mbappé", "Jude Bellingham"];

  assert.equal(getPlayerChartLabel("Kylian Mbappé", names), "Mbappé");
});

test("uses full names when players share a surname", () => {
  const names = ["Gonzalo García", "Fran García"];

  assert.equal(getPlayerChartLabel("Gonzalo García", names), "Gonzalo García");
  assert.equal(getPlayerChartLabel("Fran García", names), "Fran García");
});
