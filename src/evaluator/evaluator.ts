import { ASTNode, Expression, Statement } from '../ast/ast'
import { BlockStatement } from '../ast/blockStatement'
import { Boolean as BooleanAST } from '../ast/boolean'
import { CallExpression } from '../ast/callExpression'
import { ExpressionStatement } from '../ast/expressionStatement'
import { FunctionLiteral } from '../ast/functionLiteral'
import { Identifier } from '../ast/identifier'
import { IfExpression } from '../ast/ifExpression'
import { InfixExpression } from '../ast/infixExpression'
import { IntegerLiteral } from '../ast/integerLiteral'
import { LetStatement } from '../ast/letStatement'
import { PrefixExpression } from '../ast/prefixExpression'
import { Program } from '../ast/program'
import { ReturnStatement } from '../ast/returnStatement'
import { Boolean } from '../object/boolean'
import { Environment } from '../object/environment'
import { Error } from '../object/error'
import { Function } from '../object/function'
import { Integer } from '../object/integer'
import { Null } from '../object/null'
import { Object, ObjectTypeTable } from '../object/object'
import { ReturnValue } from '../object/returnValue'

const TRUE = Boolean.new(true)
const FALSE = Boolean.new(false)
const NULL = Null.new()

export function evaluator(node: ASTNode, env: Environment): Object {
  if (node instanceof IntegerLiteral) {
    return Integer.new(node.value)
  } else if (node instanceof Program) {
    return evalProgram(node, env)
  } else if (node instanceof ExpressionStatement) {
    return evaluator(node.expression, env)
  } else if (node instanceof BooleanAST) {
    return nativeBoolToBooleanObject(node.value)
  } else if (node instanceof PrefixExpression) {
    const right = evaluator(node.right, env)
    if (isError(right)) return right
    return evalPrefixExpression(node.operator, right)
  } else if (node instanceof InfixExpression) {
    const left = evaluator(node.left, env)
    if (isError(left)) return left
    const right = evaluator(node.right, env)
    if (isError(right)) return right
    return evalInfixExpression(node.operator, left, right)
  } else if (node instanceof IfExpression) {
    return evalIfExpression(node, env)
  } else if (node instanceof BlockStatement) {
    return evalBlockStatements(node, env)
  } else if (node instanceof ReturnStatement) {
    const value = evaluator(node.returnValue, env)
    if (isError(value)) return value
    return ReturnValue.new(value)
  } else if (node instanceof LetStatement) {
    const value = evaluator(node.value, env)
    if (isError(value)) return value
    env.set(node.name.value, value)
  } else if (node instanceof Identifier) {
    return evalIdentifier(node, env)
  } else if (node instanceof FunctionLiteral) {
    const params = node.parameters
    const body = node.body
    return Function.new(params, body, env)
  } else if (node instanceof CallExpression) {
    const func = evaluator(node.func, env)
    if (isError(func)) return func
    const args = evalExpressions(node.args, env)
    if (args.length === 1 && isError(args[0])) {
      return args[0]
    }

    return applyFunction(func, args)
  }

  return null
}

function evalProgram(program: Program, env: Environment): Object {
  let result: Object

  for (const stmt of program.statements) {
    result = evaluator(stmt, env)
    if (result instanceof ReturnValue) {
      return result.value
    } else if (result instanceof Error) {
      return result
    }
  }

  return result
}

function evalBlockStatements(block: BlockStatement, env: Environment): Object {
  let result: Object

  for (const stmt of block.statements) {
    result = evaluator(stmt, env)
    if (
      (result !== null && result.type() === ObjectTypeTable.RETURN_VALUE_OBJ) ||
      result.type() === ObjectTypeTable.ERROR_OBJ
    ) {
      return result
    }
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
      return newError(`unknown operator: ${operator} ${right.type()}`)
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
    return newError(`unknown operator: -${right.type()}`)
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
    case left.type() != right.type():
      return newError(`type mismatch: ${left.type()} ${operator} ${right.type()}`)
    default:
      return newError(`unknown operator: ${left.type()} ${operator} ${right.type()}`)
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
      return newError(`unknown operator: ${left.type()} ${operator} ${right.type()}`)
  }
}

function evalIfExpression(ie: IfExpression, env: Environment): Object {
  const condition = evaluator(ie.condition, env)

  if (isTruthy(condition)) {
    return evaluator(ie.consequence, env)
  } else if (ie.alternative) {
    return evaluator(ie.alternative, env)
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

function newError(message: string): Error {
  return Error.new(message)
}

function isError(obj: Object): boolean {
  if (obj) {
    return obj.type() === ObjectTypeTable.ERROR_OBJ
  }
  return false
}

function evalIdentifier(node: Identifier, env: Environment): Object {
  const value = env.get(node.value)
  if (!value) return newError(`identifier not found: ${node.value}`)
  return value
}

function evalExpressions(exps: Expression[], env: Environment): Object[] {
  let result: Object[] = []

  for (const exp of exps) {
    const evaluated = evaluator(exp, env)
    if (isError(evaluated)) {
      return [evaluated]
    }
    result.push(evaluated)
  }

  return result
}

function applyFunction(fn: Object, args: Object[]): Object {
  if (!(fn instanceof Function)) {
    return newError(`not a function: ${fn.type()}`)
  }

  const fnObj = fn as Function
  const extendedEnv = extendedFunctionEnv(fnObj, args)
  const evaluated = evaluator(fnObj.body, extendedEnv)
  return unwrapReturnValue(evaluated)
}

function extendedFunctionEnv(fn: Function, args: Object[]): Environment {
  const env = Environment.newEnclosedEnvironment(fn.env)

  fn.parameters.forEach((param, idx) => {
    env.set(param.value, args[idx])
  })

  return env
}

function unwrapReturnValue(obj: Object): Object {
  if (obj instanceof ReturnValue) {
    return obj.value
  }

  return obj
}
