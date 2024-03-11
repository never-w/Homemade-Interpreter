import { ObjectTypeTable, Object } from './object'

export class Boolean implements Object {
  private constructor(public value: boolean) {}

  static new(value: boolean): Boolean {
    return new Boolean(value)
  }

  inspect(): string {
    return `${this.value}`
  }

  type(): string {
    return ObjectTypeTable.BOOLEAN_OBJ
  }
}
