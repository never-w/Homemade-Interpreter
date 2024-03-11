import { Object, ObjectTypeTable } from './object'

export class Null implements Object {
  inspect(): string {
    return 'null'
  }

  type(): ObjectTypeTable {
    return ObjectTypeTable.NULL_OBJ
  }
}
