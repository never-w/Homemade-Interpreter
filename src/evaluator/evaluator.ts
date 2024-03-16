import { ASTNode, Statement } from '../ast/ast'
import { BlockStatement } from '../ast/blockStatement'
import { Boolean as BooleanAST } from '../ast/boolean'
import { ExpressionStatement } from '../ast/expressionStatement'
import { IfExpression } from '../ast/ifExpression'
import { InfixExpression } from '../ast/infixExpression'
import { IntegerLiteral } from '../ast/integerLiteral'
import { PrefixExpression } from '../ast/prefixExpression'
import { Program } from '../ast/program'
import { Boolean } from '../object/boolean'
import { Integer } from '../object/integer'
import { Null } from '../object/null'
import { Object, ObjectTypeTable } from '../object/object'

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
  } else if (node instanceof PrefixExpression) {
    const right = evaluator(node.right)
    return evalPrefixExpression(node.operator, right)
  } else if (node instanceof InfixExpression) {
    const left = evaluator(node.left)
    const right = evaluator(node.right)
    return evalInfixExpression(node.operator, left, right)
  } else if (node instanceof IfExpression) {
    return evalIfExpression(node)
  } else if (node instanceof BlockStatement) {
    return evalStatements(node.statements)
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

function evalPrefixExpression(operator: string, right: Object): Object {
  switch (operator) {
    case '!':
      return evalBangOperatorExpression(right)
    case '-':
      return evalMinusPrefixOperatorExpression(right)
    default:
      return NULL
  }
}

function evalBangOperatorExpression(right: Object): Object {
  switch (right) {
    case TRUE:
      return FALSE
    case FALSE:
      return TRUE
    case NULL:
      return TRUE
    default:
      return FALSE
  }
}

function evalMinusPrefixOperatorExpression(right: Object): Object {
  if (right.type() !== ObjectTypeTable.INTEGER_OBJ) {
    return NULL
  }

  const value = (right as Integer).value
  return Integer.new(-value)
}

function evalInfixExpression(operator: String, left: Object, right: Object) {
  switch (true) {
    case left.type() === ObjectTypeTable.INTEGER_OBJ && right.type() === ObjectTypeTable.INTEGER_OBJ:
      return evalIntegerInfixExpression(operator, left, right)
    case operator === '==':
      return nativeBoolToBooleanObject(left === right)
    case operator === '!=':
      return nativeBoolToBooleanObject(left !== right)
  }
}

function evalIntegerInfixExpression(operator: String, left: Object, right: Object) {
  const leftVal = (left as Integer).value
  const rightVal = (right as Integer).value

  switch (operator) {
    case '+':
      return Integer.new(leftVal + rightVal)
    case '-':
      return Integer.new(leftVal - rightVal)
    case '/':
      return Integer.new(leftVal / rightVal)
    case '*':
      return Integer.new(leftVal * rightVal)
    case '<':
      return nativeBoolToBooleanObject(leftVal < rightVal)
    case '>':
      return nativeBoolToBooleanObject(leftVal > rightVal)
    case '==':
      // 这里使用 === 因为js的全等
      return nativeBoolToBooleanObject(leftVal === rightVal)
    case '!=':
      return nativeBoolToBooleanObject(leftVal != rightVal)
    default:
      return NULL
  }
}

function evalIfExpression(ie: IfExpression): Object {
  const condition = evaluator(ie.condition)

  if (isTruthy(condition)) {
    return evaluator(ie.consequence)
  } else if (ie.alternative) {
    return evaluator(ie.alternative)
  } else {
    return NULL
  }
}

function isTruthy(obj: Object): boolean {
  switch (obj) {
    case NULL:
      return false
    case TRUE:
      return true
    case FALSE:
      return false
    default:
      return true
  }
}
