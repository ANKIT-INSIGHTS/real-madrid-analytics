import test from "node:test";
import assert from "node:assert/strict";
import { per90, sortPlayers } from "../src/playerStats.js";

const players = [
  { name: "Zeta", goals: 3, assists: 1, minutes: 360 },
  { name: "Alpha", goals: 8, assists: 2, minutes: 900 },
  { name: "Beta", goals: 2, assists: 4, minutes: 180 },
];

test("sorts player names in either direction", () => {
  assert.deepEqual(sortPlayers(players, "name", "asc").map((p) => p.name), ["Alpha", "Beta", "Zeta"]);
  assert.deepEqual(sortPlayers(players, "name", "desc").map((p) => p.name), ["Zeta", "Beta", "Alpha"]);
});

test("sorts numeric and per-90 stats in either direction", () => {
  assert.deepEqual(sortPlayers(players, "goals", "desc").map((p) => p.name), ["Alpha", "Zeta", "Beta"]);
  assert.deepEqual(sortPlayers(players, "per90", "asc").map((p) => p.name), ["Zeta", "Alpha", "Beta"]);
  assert.equal(per90({ goals: 2, assists: 1, minutes: 0 }), 0);
});

test("does not mutate the filtered player list", () => {
  const originalOrder = players.map((p) => p.name);
  sortPlayers(players, "name", "asc");
  assert.deepEqual(players.map((p) => p.name), originalOrder);
});
