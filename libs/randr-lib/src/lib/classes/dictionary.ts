import { IKeyCollection } from '../interfaces/key-collection.interface';

export default class Dictionary<TKey extends keyof TValue, TValue>
  implements IKeyCollection<TKey, TValue>
{
  private items!: {
    [index in TKey]: TValue;
  };
  private count: number = 0;

  add(key: TKey, value: TValue) {
    if (!this.items.hasOwnProperty(key)) {
      this.count++;
    }

    this.items[key] = value;
  }

  containsKey(key: TKey): boolean {
    return this.items.hasOwnProperty(key);
  }

  size(): number {
    return this.count;
  }

  getItem(key: TKey): TValue {
    return this.items[key];
  }

  removeItem(key: TKey): TValue {
    let value = this.items[key];

    delete this.items[key];
    this.count--;

    return value;
  }

  getKeys(): TKey[] {
    let keySet: TKey[] = [];

    for (let property in this.items) {
      if (this.items.hasOwnProperty(property)) {
        keySet.push(property);
      }
    }

    return keySet;
  }

  values(): TValue[] {
    let values: TValue[] = [];

    for (let property in this.items) {
      if (this.items.hasOwnProperty(property)) {
        values.push(this.items[property]);
      }
    }

    return values;
  }
}
