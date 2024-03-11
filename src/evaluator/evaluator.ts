import { ASTNode, Statement } from '../ast/ast'
import { ExpressionStatement } from '../ast/expressionStatement'
import { IntegerLiteral } from '../ast/integerLiteral'
import { Program } from '../ast/program'
import { Integer } from '../object/integer'
import { Object } from '../object/object'

export function evaluator(node: ASTNode): Object {
  if (node instanceof IntegerLiteral) {
    return Integer.new(node.value)
  } else if (node instanceof Program) {
    return evalStatements(node.statements)
  } else if (node instanceof ExpressionStatement) {
    return evaluator(node.expression)
  }

  return null
}

function evalStatements(stmts: Statement[]): Object {
  let result: Object

  for (const stmt of stmts) {
    result = evaluator(stmt)
  }

  return result
}
