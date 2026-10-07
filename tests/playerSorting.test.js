import test from "node:test";
import assert from "node:assert/strict";
import { sortPlayers } from "../src/playerSorting.js";

const players = [
  { name: "Vinícius Júnior", goals: 16, assists: 8, minutes: 2500 },
  { name: "Arda Güler", goals: 4, assists: 9, minutes: 2200 },
  { name: "Kylian Mbappé", goals: 25, assists: 5, minutes: 2950 },
];

test("sorts player names alphabetically in both directions", () => {
  assert.deepEqual(
    sortPlayers(players, "name", "asc").map((player) => player.name),
    ["Arda Güler", "Kylian Mbappé", "Vinícius Júnior"]
  );
  assert.deepEqual(
    sortPlayers(players, "name", "desc").map((player) => player.name),
    ["Vinícius Júnior", "Kylian Mbappé", "Arda Güler"]
  );
});

test("sorts numeric and per-90 statistics without mutating the input", () => {
  const original = [...players];
  assert.deepEqual(
    sortPlayers(players, "goals", "desc").map((player) => player.goals),
    [25, 16, 4]
  );
  assert.deepEqual(
    sortPlayers(players, "per90", "desc").map((player) => player.name),
    ["Kylian Mbappé", "Vinícius Júnior", "Arda Güler"]
  );
  assert.deepEqual(players, original);
});
