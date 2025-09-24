export const unwrap = <T>(raw: unknown): T => {
  let cur: any = raw;
  while (
    cur &&
    typeof cur === "object" &&
    "data" in cur &&
    Object.keys(cur).length === 1
  ) {
    cur = cur.data;
  }
  return cur as T;
};
