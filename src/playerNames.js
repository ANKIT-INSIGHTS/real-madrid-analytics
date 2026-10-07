export function getPlayerChartLabel(name, allNames) {
  const surname = name.trim().split(/\s+/).at(-1);
  const hasSameSurname = allNames.some(
    (otherName) => otherName !== name && otherName.trim().split(/\s+/).at(-1) === surname
  );

  return hasSameSurname ? name : surname;
}
