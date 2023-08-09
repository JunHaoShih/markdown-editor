/**
 * Return a valid name if duplicate name found
 * @param names Names that should not be duplicated
 * @param targetName the name you want to check
 * @param starter suffix number
 */
export function getValidName(names: string[], targetName: string, starter = 1) {
  if (!names.find((name) => name === targetName)) {
    return targetName;
  }
  if (names.find((name) => name === `${targetName} (${starter})`)) {
    starter += 1;
  }
  return `${targetName} (${starter})`;
}
