const CSV_HEADER = [
  "Player",
  "Position",
  "Age",
  "Goals",
  "Assists",
  "Minutes",
  "Matches",
  "G+A per 90",
  "Data status",
];

function escapeCsvValue(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function buildPlayerCsv(players, getPer90) {
  const rows = players.map((player) => [
    player.name,
    player.pos,
    player.age,
    player.goals,
    player.assists,
    player.minutes,
    player.matches,
    getPer90(player).toFixed(2),
    player.verified ? "Verified" : "Estimated",
  ]);

  return [CSV_HEADER, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n");
}
