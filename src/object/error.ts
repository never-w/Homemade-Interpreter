import { Object, ObjectTypeTable } from './object'

export class Error implements Object {
  private constructor(public message: string) {}

  public static new(message: string): Error {
    return new Error(message)
  }

  type(): ObjectTypeTable {
    return ObjectTypeTable.ERROR_OBJ
  }

  inspect(): string {
    return `ERROR: ${this.message}`
  }
}
