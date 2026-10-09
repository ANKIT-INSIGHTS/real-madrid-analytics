export function per90(player) {
  return player.minutes ? ((player.goals + player.assists) * 90 / player.minutes) : 0;
}

export function sortPlayers(players, sortKey, sortDir) {
  const sorted = [...players];
  sorted.sort((a, b) => {
    const left = sortKey === "per90" ? per90(a) : a[sortKey];
    const right = sortKey === "per90" ? per90(b) : b[sortKey];
    const comparison = typeof left === "string" ? left.localeCompare(right) : left - right;
    return sortDir === "desc" ? -comparison : comparison;
  });
  return sorted;
}
