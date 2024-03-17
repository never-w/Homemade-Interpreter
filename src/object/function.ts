import { BlockStatement } from '../ast/blockStatement'
import { Identifier } from '../ast/identifier'
import { Environment } from './environment'
import { Object, ObjectTypeTable } from './object'

export class Function implements Object {
  private constructor(
    public parameters: Identifier[],
    public body: BlockStatement,
    public env: Environment,
  ) {}

  public static new(parameters: Identifier[], body: BlockStatement, env: Environment): Function {
    return new Function(parameters, body, env)
  }

  type(): ObjectTypeTable {
    return ObjectTypeTable.FUNCTION_OBJ
  }

  inspect(): string {
    let out = ''
    const params: string[] = []

    for (const p of this.parameters) {
      params.push(p.string())
    }

    out += 'fn'
    out += '('
    out += params.join(', ')
    out += ') {\n'
    out += this.body.string()
    out += '\n}'

    return out
  }
}
