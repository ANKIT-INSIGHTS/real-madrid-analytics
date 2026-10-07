import test from "node:test";
import assert from "node:assert/strict";
import { comparePlayers, per90 } from "../src/playerUtils.js";

const mbappe = { name: "Kylian Mbappé", goals: 25, assists: 5, minutes: 2950 };
const valverde = { name: "Federico Valverde", goals: 5, assists: 9, minutes: 3200 };

test("sorts player names in either direction without case sensitivity", () => {
  assert.ok(comparePlayers(mbappe, valverde, "name", "asc") > 0);
  assert.ok(comparePlayers(mbappe, valverde, "name", "desc") < 0);
});

test("sorts numeric stats in either direction", () => {
  assert.ok(comparePlayers(mbappe, valverde, "goals", "desc") < 0);
  assert.ok(comparePlayers(mbappe, valverde, "goals", "asc") > 0);
});

test("sorts by goal involvement per 90 minutes", () => {
  assert.equal(per90(mbappe), 30 * 90 / 2950);
  assert.ok(comparePlayers(mbappe, valverde, "per90", "desc") < 0);
});
