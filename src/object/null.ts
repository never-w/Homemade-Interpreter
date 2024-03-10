import { Object, ObjectTypeTable } from './object'

export class Null implements Object {
  type(): ObjectTypeTable {
    return ObjectTypeTable.NULL_OBJ
  }

  inspect(): string {
    return 'null'
  }
}
