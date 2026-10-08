export function per90(player) {
  return player.minutes ? ((player.goals + player.assists) * 90 / player.minutes) : 0;
}

export function sortPlayers(players, sortKey, sortDir) {
  const direction = sortDir === "desc" ? -1 : 1;
  return [...players].sort((a, b) => {
    const comparison = sortKey === "name"
      ? a.name.localeCompare(b.name)
      : (sortKey === "per90" ? per90(a) - per90(b) : a[sortKey] - b[sortKey]);
    return comparison * direction;
  });
}
