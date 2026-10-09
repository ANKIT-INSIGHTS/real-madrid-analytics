export function per90(player) {
  return player.minutes ? ((player.goals + player.assists) * 90 / player.minutes) : 0;
}

export function sortPlayers(players, sortKey, sortDir) {
  const direction = sortDir === "desc" ? -1 : 1;
  return [...players].sort((a, b) => {
    const valueA = sortKey === "per90" ? per90(a) : a[sortKey];
    const valueB = sortKey === "per90" ? per90(b) : b[sortKey];
    const comparison = typeof valueA === "string" && typeof valueB === "string"
      ? valueA.localeCompare(valueB)
      : valueA - valueB;
    return comparison * direction;
  });
}
