import test from "node:test";
import assert from "node:assert/strict";
import { sortPlayers } from "./playerStats.js";

const players = [
  { name: "Zidane", goals: 8, assists: 2, minutes: 900 },
  { name: "Arda", goals: 2, assists: 5, minutes: 700 },
  { name: "Bellingham", goals: 6, assists: 3, minutes: 1200 },
];

test("sorts player names alphabetically in either direction", () => {
  assert.deepEqual(
    sortPlayers(players, "name", "asc").map((player) => player.name),
    ["Arda", "Bellingham", "Zidane"],
  );
  assert.deepEqual(
    sortPlayers(players, "name", "desc").map((player) => player.name),
    ["Zidane", "Bellingham", "Arda"],
  );
});

test("sorts numeric stats and per-90 rates without mutating the input", () => {
  assert.deepEqual(
    sortPlayers(players, "goals", "desc").map((player) => player.goals),
    [8, 6, 2],
  );
  assert.deepEqual(
    sortPlayers(players, "per90", "desc").map((player) => player.name),
    ["Zidane", "Arda", "Bellingham"],
  );
  assert.deepEqual(players.map((player) => player.name), ["Zidane", "Arda", "Bellingham"]);
});
