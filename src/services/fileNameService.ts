/**
 * Return a valid name if duplicate name found
 * @param names Names that should not be duplicated
 * @param targetName the name you want to check
 * @param starter suffix number
 */
export function getValidName(names: string[], targetName: string, starter = 1): string {
  if (!names.find((name) => name === targetName)) {
    return targetName;
  }
  if (names.find((name) => name === `${targetName} (${starter})`)) {
    const newName = getValidName(names, targetName, starter += 1);
    return newName;
  }
  return `${targetName} (${starter})`;
}
