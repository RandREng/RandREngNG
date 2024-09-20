export type IDictionary<TKey extends keyof any, TValue> = {
  [index in TKey]: TValue;
};
