import { strict as assert } from "node:assert";
import { test } from "node:test";
import { per90, sortPlayers } from "./playerStats.js";

const players = [
  { name: "Vinícius Júnior", goals: 16, assists: 8, minutes: 2500 },
  { name: "Kylian Mbappé", goals: 25, assists: 5, minutes: 2950 },
  { name: "Arda Güler", goals: 4, assists: 9, minutes: 2200 },
];

test("sorts player names in both directions without mutating the input", () => {
  const original = [...players];

  assert.deepEqual(sortPlayers(players, "name", "asc").map((player) => player.name), [
    "Arda Güler",
    "Kylian Mbappé",
    "Vinícius Júnior",
  ]);
  assert.deepEqual(sortPlayers(players, "name", "desc").map((player) => player.name), [
    "Vinícius Júnior",
    "Kylian Mbappé",
    "Arda Güler",
  ]);
  assert.deepEqual(players, original);
});

test("sorts numeric statistics and goal involvement per 90", () => {
  assert.deepEqual(sortPlayers(players, "goals", "desc").map((player) => player.goals), [25, 16, 4]);
  assert.deepEqual(sortPlayers(players, "per90", "desc").map((player) => player.name), [
    "Kylian Mbappé",
    "Vinícius Júnior",
    "Arda Güler",
  ]);
});

test("returns zero per 90 when a player has no minutes", () => {
  assert.equal(per90({ goals: 2, assists: 1, minutes: 0 }), 0);
});
