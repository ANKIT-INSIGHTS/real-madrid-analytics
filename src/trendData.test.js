import assert from "node:assert/strict";
import test from "node:test";
import { buildTrendData } from "./trendData.js";

test("keeps goal series separate for players with the same surname", () => {
  const players = [
    { name: "Gonzalo García", trend: Array.from({ length: 38 }, (_, i) => ({ goals: i + 1 })) },
    { name: "Fran García", trend: Array.from({ length: 38 }, (_, i) => ({ goals: i + 101 })) },
  ];

  const rows = buildTrendData(players);

  assert.equal(rows.length, 38);
  assert.equal(rows[0]["Gonzalo García"], 1);
  assert.equal(rows[0]["Fran García"], 101);
  assert.equal(rows[37]["Gonzalo García"], 38);
  assert.equal(rows[37]["Fran García"], 138);
});
