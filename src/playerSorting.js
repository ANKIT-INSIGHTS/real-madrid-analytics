export function per90(player) {
  return player.minutes ? ((player.goals + player.assists) * 90 / player.minutes) : 0;
}

export function sortPlayers(players, sortKey, sortDir) {
  const sorted = [...players];
  sorted.sort((a, b) => {
    const aValue = sortKey === "per90" ? per90(a) : a[sortKey];
    const bValue = sortKey === "per90" ? per90(b) : b[sortKey];
    const comparison = typeof aValue === "string" && typeof bValue === "string"
      ? aValue.localeCompare(bValue)
      : aValue - bValue;
    return sortDir === "desc" ? -comparison : comparison;
  });
  return sorted;
}
