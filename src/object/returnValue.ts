import { Object, ObjectTypeTable } from './object'

export class ReturnValue implements Object {
  private constructor(public value: Object) {}

  public static new(value: Object): ReturnValue {
    return new ReturnValue(value)
  }

  inspect(): string {
    return this.value.inspect()
  }

  type(): ObjectTypeTable {
    return ObjectTypeTable.RETURN_VALUE_OBJ
  }
}
