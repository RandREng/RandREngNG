// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IDictionary<TKey extends keyof any, TValue> = {
  [index in TKey]: TValue;
};
