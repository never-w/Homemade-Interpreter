import { Object, ObjectTypeTable } from './object'

export class Null implements Object {
  private constructor(public value: null = null) {}

  static new(): Null {
    return new Null()
  }

  inspect(): string {
    return 'null'
  }

  type(): ObjectTypeTable {
    return ObjectTypeTable.NULL_OBJ
  }
}
