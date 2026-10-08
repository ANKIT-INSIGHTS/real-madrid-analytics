export function sortPlayers(players, sortKey, sortDir, per90) {
  const direction = sortDir === "desc" ? -1 : 1;
  return [...players].sort((a, b) => {
    const aValue = sortKey === "per90" ? per90(a) : a[sortKey];
    const bValue = sortKey === "per90" ? per90(b) : b[sortKey];
    const comparison = typeof aValue === "string" && typeof bValue === "string"
      ? aValue.localeCompare(bValue)
      : aValue - bValue;
    return comparison * direction;
  });
}
