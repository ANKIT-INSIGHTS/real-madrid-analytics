import assert from "node:assert/strict";
import test from "node:test";
import { per90, sortPlayers } from "../src/playerUtils.js";

const players = [
  { name: "Zidane", goals: 4, assists: 2, minutes: 900 },
  { name: "Arda", goals: 2, assists: 3, minutes: 450 },
  { name: "Jude", goals: 5, assists: 1, minutes: 1800 },
];

test("sortPlayers sorts string columns in either direction without mutating input", () => {
  assert.deepEqual(
    sortPlayers(players, "name", "asc").map((player) => player.name),
    ["Arda", "Jude", "Zidane"],
  );
  assert.deepEqual(
    sortPlayers(players, "name", "desc").map((player) => player.name),
    ["Zidane", "Jude", "Arda"],
  );
  assert.deepEqual(players.map((player) => player.name), ["Zidane", "Arda", "Jude"]);
});

test("sortPlayers sorts numeric columns and goal involvement per 90", () => {
  assert.deepEqual(
    sortPlayers(players, "goals", "desc").map((player) => player.name),
    ["Jude", "Zidane", "Arda"],
  );
  assert.deepEqual(
    sortPlayers(players, "per90", "desc").map((player) => player.name),
    ["Arda", "Zidane", "Jude"],
  );
});

test("per90 returns zero when a player has no minutes", () => {
  assert.equal(per90({ goals: 2, assists: 1, minutes: 0 }), 0);
});
