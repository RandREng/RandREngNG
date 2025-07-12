import { IKeyCollection } from '../interfaces/key-collection.interface';

export default class Dictionary<TKey extends keyof TValue, TValue>
  implements IKeyCollection<TKey, TValue> {
  private items!: {
    [index in TKey]: TValue;
  };
  private count = 0;

  add(key: TKey, value: TValue) {
    if (!Object.prototype.hasOwnProperty.call(this.items, key)) {
      this.count++;
    }

    this.items[key] = value;
  }

  containsKey(key: TKey): boolean {
    return Object.prototype.hasOwnProperty.call(this.items, key);
  }

  size(): number {
    return this.count;
  }

  getItem(key: TKey): TValue {
    return this.items[key];
  }

  removeItem(key: TKey): TValue {
    const value = this.items[key];

    delete this.items[key];
    this.count--;

    return value;
  }

  getKeys(): TKey[] {
    const keySet: TKey[] = [];

    for (const property in this.items) {
      if (Object.prototype.hasOwnProperty.call(this.items, property)) {
        keySet.push(property);
      }
    }

    return keySet;
  }

  values(): TValue[] {
    const values: TValue[] = [];

    for (const property in this.items) {
      if (Object.prototype.hasOwnProperty.call(this.items, property)) {
        values.push(this.items[property]);
      }
    }

    return values;
  }
}
