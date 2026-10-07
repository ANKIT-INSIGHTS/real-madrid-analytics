import test from "node:test";
import assert from "node:assert/strict";
import { comparePlayers, per90 } from "./playerStats.js";

const players = [
  { name: "Vinícius Júnior", goals: 16, assists: 8, minutes: 2500 },
  { name: "Kylian Mbappé", goals: 25, assists: 5, minutes: 2950 },
];

test("sorts player names in both directions", () => {
  assert.deepEqual([...players].sort((a, b) => comparePlayers(a, b, "name", "asc")).map((p) => p.name), [
    "Kylian Mbappé",
    "Vinícius Júnior",
  ]);
  assert.deepEqual([...players].sort((a, b) => comparePlayers(a, b, "name", "desc")).map((p) => p.name), [
    "Vinícius Júnior",
    "Kylian Mbappé",
  ]);
});

test("retains descending and ascending numeric sorting", () => {
  assert.ok(comparePlayers(players[0], players[1], "goals", "desc") > 0);
  assert.ok(comparePlayers(players[0], players[1], "goals", "asc") < 0);
});

test("calculates goal involvement per 90 and handles zero minutes", () => {
  assert.equal(per90(players[0]), 0.864);
  assert.equal(per90({ goals: 3, assists: 2, minutes: 0 }), 0);
  assert.ok(comparePlayers(players[0], players[1], "per90", "desc") > 0);
});
