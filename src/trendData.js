export function buildTrendData(players) {
  const weeks = Array.from({ length: 38 }, (_, i) => ({ week: i + 1 }));
  weeks.forEach((row) => {
    players.forEach((player) => {
      row[player.name] = player.trend[row.week - 1].goals;
    });
  });
  return weeks;
}
