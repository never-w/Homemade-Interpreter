import { Lexer } from '../lexer/lexer'
import { Parser } from '../parser/parser'
import { Object } from '../object/object'
import { Integer } from '../object/integer'
import { evaluator } from './evaluator'
import { Boolean } from '../object/boolean'

describe('Evaluator', () => {
  it('should evaluate integer expression', () => {
    const tests = [
      {
        input: '5',
        expected: 5,
      },
      {
        input: '10',
        expected: 10,
      },
    ]

    for (const test of tests) {
      const evaluated = testEval(test.input)
      expect(testIntegerObject(evaluated, test.expected)).toEqual(true)
    }
  })

  it('should evaluate boolean expression', () => {
    const tests = [
      {
        input: 'true',
        expected: true,
      },
      {
        input: 'false',
        expected: false,
      },
    ]

    for (const test of tests) {
      const evaluated = testEval(test.input)
      expect(testBooleanObject(evaluated, test.expected)).toEqual(true)
    }
  })
})

function testEval(input: string) {
  const lexer = Lexer.newLexer(input)
  const parser = Parser.newParser(lexer)
  const program = parser.parseProgram()

  return evaluator(program)
}

function testIntegerObject(obj: Object, expected: number): boolean {
  if (!(obj instanceof Integer)) return false

  const intObj = obj as Integer

  if (intObj.value !== expected) return false

  return true
}

function testBooleanObject(obj: Object, expected: boolean): boolean {
  if (!(obj instanceof Boolean)) return false

  const boolObj = obj as Boolean

  if (boolObj.value !== expected) return false

  return true
}