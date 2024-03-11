import { ObjectTypeTable, Object } from './object'

export class Integer implements Object {
  private constructor(public value: number) {}

  static new(value: number): Integer {
    return new Integer(value)
  }

  inspect(): string {
    return `${this.value}`
  }

  type(): string {
    return ObjectTypeTable.INTEGER_OBJ
  }
}
