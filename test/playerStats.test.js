import test from "node:test";
import assert from "node:assert/strict";
import { goalsPer90 } from "../src/playerStats.js";

test("calculates goals per 90 minutes without including assists", () => {
  assert.equal(goalsPer90({ goals: 25, assists: 5, minutes: 2950 }), (25 * 90) / 2950);
});

test("returns zero goals per 90 when the player has no minutes", () => {
  assert.equal(goalsPer90({ goals: 3, assists: 2, minutes: 0 }), 0);
});
