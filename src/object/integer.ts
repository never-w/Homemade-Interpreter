import { ObjectTypeTable, Object } from './object'

export class Integer implements Object {
  value: number

  inspect(): string {
    return `${this.value}`
  }

  type(): string {
    return ObjectTypeTable.INTEGER_OBJ
  }
}
