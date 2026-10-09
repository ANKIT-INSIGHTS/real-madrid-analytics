import assert from "node:assert/strict";
import test from "node:test";
import { per90, sortPlayers } from "../src/playerStats.js";

const players = [
  { name: "Vinícius Júnior", goals: 16, assists: 8, minutes: 2500 },
  { name: "Kylian Mbappé", goals: 25, assists: 5, minutes: 2950 },
  { name: "Arda Güler", goals: 4, assists: 9, minutes: 2200 },
];

test("sorts player names alphabetically in both directions", () => {
  assert.deepEqual(
    sortPlayers(players, "name", "asc").map((player) => player.name),
    ["Arda Güler", "Kylian Mbappé", "Vinícius Júnior"],
  );
  assert.deepEqual(
    sortPlayers(players, "name", "desc").map((player) => player.name),
    ["Vinícius Júnior", "Kylian Mbappé", "Arda Güler"],
  );
});

test("sorts numeric stats and per-90 values in both directions", () => {
  assert.deepEqual(
    sortPlayers(players, "goals", "desc").map((player) => player.goals),
    [25, 16, 4],
  );
  assert.deepEqual(
    sortPlayers(players, "per90", "asc").map((player) => player.name),
    ["Arda Güler", "Vinícius Júnior", "Kylian Mbappé"],
  );
  assert.equal(per90({ goals: 0, assists: 0, minutes: 0 }), 0);
});

test("does not mutate the source player list", () => {
  const input = [...players];
  sortPlayers(input, "name", "asc");
  assert.deepEqual(input, players);
});
