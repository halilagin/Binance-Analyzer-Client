
export interface IKeyedCollection<T> {
  Add(key: string, value: T);
  ContainsKey(key: string): boolean;
  Count(): number;
  Item(key: string): T;
  Keys(): string[];
  Remove(key: string): T;
  Values(): T[];
}


//see :https://www.dustinhorne.com/post/2016/06/09/implementing-a-dictionary-in-typescript

export class KeyedCollection<T> implements IKeyedCollection<T> {
  private items: { [index: string]: T } = {};

  private count: number = 0;

  public containsKey(key: string): boolean {
    return this.items.hasOwnProperty(key);
  }

  public count(): number {
    return this.count;
  }

  public add(key: string, value: T) {
    if(!this.items.hasOwnProperty(key))
      this.count++;

    this.items[key] = value;
  }

  public remove(key: string): T {
    var val = this.items[key];
    delete this.items[key];
    this.count--;
    return val;
  }

  public item(key: string): T {
    return this.items[key];
  }

  public keys(): string[] {
    var keySet: string[] = [];

    for (var prop in this.items) {
      if (this.items.hasOwnProperty(prop)) {
        keySet.push(prop);
      }
    }

    return keySet;
  }

  public values(): T[] {
    var values: T[] = [];

    for (var prop in this.items) {
      if (this.items.hasOwnProperty(prop)) {
        values.push(this.items[prop]);
      }
    }

    return values;
  }
}
