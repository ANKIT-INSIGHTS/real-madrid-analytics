import test from "node:test";
import assert from "node:assert/strict";
import { comparePlayers, per90 } from "../src/player-utils.js";

const players = [
  { name: "Vinícius Júnior", goals: 16, assists: 8, minutes: 2500 },
  { name: "Kylian Mbappé", goals: 25, assists: 5, minutes: 2950 },
];

test("sorts player names in both directions", () => {
  assert.ok(comparePlayers(players[1], players[0], "name", "asc") < 0);
  assert.ok(comparePlayers(players[1], players[0], "name", "desc") > 0);
});

test("sorts numeric statistics in both directions", () => {
  assert.ok(comparePlayers(players[1], players[0], "goals", "desc") < 0);
  assert.ok(comparePlayers(players[1], players[0], "goals", "asc") > 0);
});

test("sorts per-90 rates and safely handles players with no minutes", () => {
  const withoutMinutes = { name: "No minutes", goals: 1, assists: 0, minutes: 0 };

  assert.equal(per90(withoutMinutes), 0);
  assert.ok(comparePlayers(players[0], withoutMinutes, "per90", "desc") < 0);
});
