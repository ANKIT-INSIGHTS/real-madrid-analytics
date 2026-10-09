import assert from "node:assert/strict";
import test from "node:test";
import { goalsPer90, per90 } from "./playerStats.js";

test("goalsPer90 excludes assists while per90 retains total goal involvement", () => {
  const player = { goals: 15, assists: 5, minutes: 900 };

  assert.equal(goalsPer90(player), 1.5);
  assert.equal(per90(player), 2);
});

test("goalsPer90 ranks the top scorer independently of assists", () => {
  const players = [
    { name: "More assists", goals: 9, assists: 10, minutes: 900 },
    { name: "More goals", goals: 10, assists: 0, minutes: 900 },
  ];

  const topScorer = [...players].sort((a, b) => goalsPer90(b) - goalsPer90(a))[0];
  assert.equal(topScorer.name, "More goals");
});

test("per-90 rates are zero when a player has no minutes", () => {
  const player = { goals: 15, assists: 5, minutes: 0 };

  assert.equal(goalsPer90(player), 0);
  assert.equal(per90(player), 0);
});
