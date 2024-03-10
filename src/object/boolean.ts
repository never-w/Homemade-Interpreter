import { ObjectTypeTable, Object } from './object'

export class Boolean implements Object {
  value: boolean

  inspect(): string {
    return `${this.value}`
  }

  type(): string {
    return ObjectTypeTable.BOOLEAN_OBJ
  }
}
