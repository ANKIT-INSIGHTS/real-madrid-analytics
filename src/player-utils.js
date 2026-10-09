export function per90(player) {
  return player.minutes ? ((player.goals + player.assists) * 90 / player.minutes) : 0;
}

export function comparePlayers(a, b, sortKey, sortDir) {
  const direction = sortDir === "desc" ? -1 : 1;
  const aValue = sortKey === "per90" ? per90(a) : a[sortKey];
  const bValue = sortKey === "per90" ? per90(b) : b[sortKey];

  if (typeof aValue === "string" && typeof bValue === "string") {
    return direction * aValue.localeCompare(bValue);
  }

  return direction * (aValue - bValue);
}
