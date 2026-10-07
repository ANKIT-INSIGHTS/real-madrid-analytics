import assert from "node:assert/strict";
import test from "node:test";
import { comparePlayers } from "../src/playerStats.js";

const mbappe = { name: "Kylian Mbappé", goals: 25, assists: 5, minutes: 2950 };
const vinicius = { name: "Vinícius Júnior", goals: 16, assists: 8, minutes: 2500 };

test("sorts player names in both directions", () => {
  assert.ok(comparePlayers(mbappe, vinicius, "name", "asc") < 0);
  assert.ok(comparePlayers(mbappe, vinicius, "name", "desc") > 0);
});

test("sorts numeric statistics in descending order", () => {
  assert.ok(comparePlayers(mbappe, vinicius, "goals", "desc") < 0);
});

test("sorts goal contributions per 90 minutes", () => {
  assert.ok(comparePlayers(mbappe, vinicius, "per90", "desc") < 0);
});
