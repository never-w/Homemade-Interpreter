import { ASTNode, Statement } from '../ast/ast'
import { Boolean as BooleanAST } from '../ast/boolean'
import { ExpressionStatement } from '../ast/expressionStatement'
import { IntegerLiteral } from '../ast/integerLiteral'
import { Program } from '../ast/program'
import { Boolean } from '../object/boolean'
import { Integer } from '../object/integer'
import { Null } from '../object/null'
import { Object } from '../object/object'

const TRUE = Boolean.new(true)
const FALSE = Boolean.new(false)
const NULL = Null.new()

export function evaluator(node: ASTNode): Object {
  if (node instanceof IntegerLiteral) {
    return Integer.new(node.value)
  } else if (node instanceof Program) {
    return evalStatements(node.statements)
  } else if (node instanceof ExpressionStatement) {
    return evaluator(node.expression)
  } else if (node instanceof BooleanAST) {
    return nativeBoolToBooleanObject(node.value)
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

function nativeBoolToBooleanObject(value: boolean): Boolean {
  if (value) return TRUE

  return FALSE
}
