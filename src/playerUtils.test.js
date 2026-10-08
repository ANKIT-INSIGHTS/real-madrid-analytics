import { test } from "node:test";
import assert from "node:assert/strict";
import { sortPlayers } from "./playerUtils.js";

const players = [
  { name: "Vinícius Júnior", goals: 16, minutes: 2500, assists: 8 },
  { name: "Kylian Mbappé", goals: 25, minutes: 2950, assists: 5 },
  { name: "Arda Güler", goals: 4, minutes: 2200, assists: 9 },
];
const per90 = (player) => (player.goals + player.assists) * 90 / player.minutes;

test("sorts player names in both directions without mutating the input", () => {
  assert.deepEqual(
    sortPlayers(players, "name", "asc", per90).map((player) => player.name),
    ["Arda Güler", "Kylian Mbappé", "Vinícius Júnior"],
  );
  assert.deepEqual(
    sortPlayers(players, "name", "desc", per90).map((player) => player.name),
    ["Vinícius Júnior", "Kylian Mbappé", "Arda Güler"],
  );
  assert.equal(players[0].name, "Vinícius Júnior");
});

test("sorts numeric stats and per-90 values in both directions", () => {
  assert.deepEqual(
    sortPlayers(players, "goals", "desc", per90).map((player) => player.goals),
    [25, 16, 4],
  );
  assert.deepEqual(
    sortPlayers(players, "per90", "asc", per90).map((player) => player.name),
    ["Arda Güler", "Vinícius Júnior", "Kylian Mbappé"],
  );
});
