import { ASTNode, Statement } from './ast'

export class Program implements ASTNode {
  statements: Statement[]

  private constructor(statements: Statement[]) {
    this.statements = statements
  }

  static new(): Program {
    return new Program([])
  }

  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral()
    }
    return ''
  }

  string(): string {
    let out = ''
    for (const stmt of this.statements) {
      out += stmt.string()
    }

    return out
  }
}
