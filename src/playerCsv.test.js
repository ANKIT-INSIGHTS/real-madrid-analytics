import assert from "node:assert/strict";
import test from "node:test";
import { buildPlayerCsv } from "./playerCsv.js";

test("exports player data status and RFC 4180 escaped fields", () => {
  const players = [
    {
      name: 'A "quoted", player',
      pos: "FW",
      age: 20,
      goals: 3,
      assists: 1,
      minutes: 450,
      matches: 8,
      verified: true,
    },
    {
      name: "Line one\r\nLine two",
      pos: "MF",
      age: 22,
      goals: 1,
      assists: 2,
      minutes: 900,
      matches: 10,
      verified: false,
    },
  ];

  const csv = buildPlayerCsv(players, (player) => (
    (player.goals + player.assists) * 90 / player.minutes
  ));

  assert.equal(
    csv,
    [
      "Player,Position,Age,Goals,Assists,Minutes,Matches,G+A per 90,Data status",
      '"A ""quoted"", player",FW,20,3,1,450,8,0.80,Verified',
      '"Line one\r\nLine two",MF,22,1,2,900,10,0.30,Estimated',
    ].join("\r\n"),
  );
});
