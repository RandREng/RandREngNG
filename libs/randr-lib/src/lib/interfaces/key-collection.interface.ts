export interface IKeyCollection<S extends keyof T, T> {
  add(key: S, value: T): void;
  containsKey(key: S): boolean;
  size(): number;
  getItem(key: S): T;
  removeItem(key: S): T;
  getKeys(): S[];
  values(): T[];
}
