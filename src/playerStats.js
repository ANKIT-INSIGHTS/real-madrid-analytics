export function per90(player) {
  return player.minutes ? ((player.goals + player.assists) * 90 / player.minutes) : 0;
}

export function goalsPer90(player) {
  return player.minutes ? (player.goals * 90 / player.minutes) : 0;
}
