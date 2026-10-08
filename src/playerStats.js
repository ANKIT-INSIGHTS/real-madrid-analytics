export function goalsPer90(player) {
  return player.minutes ? (player.goals * 90) / player.minutes : 0;
}
