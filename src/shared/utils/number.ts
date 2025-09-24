export const convertToNumber = (value: string | number): number => {
  const result = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(result)) {
    throw new Error(`Cannot convert value "${value}" to number`);
  }
  return result;
};
