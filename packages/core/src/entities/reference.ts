
export interface Reference<T extends string> {
  type: T;
  id: string;
}

/**
 * Represents the index withing a sequence, with a string describing which
 * sequence it refers to.
 */
export interface IndexOf<T extends string> {
  type: T;
  index: number;
}
