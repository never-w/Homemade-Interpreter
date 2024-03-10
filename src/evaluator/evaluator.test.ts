import { Lexer } from '../lexer/lexer'
import { Parser } from '../parser/parser'
import { Object } from '../object/object'
import { Integer } from '../object/integer'

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
      //   {
      //     input: '-5',
      //     expected: -5,
      //   },
      //   {
      //     input: '-10',
      //     expected: -10,
      //   },
      //   {
      //     input: '5 + 5+ 5 + 5 -10',
      //     expected: 10,
      //   },
      //   {
      //     input: '2 * 2 * 2 * 2 * 2',
      //     expected: 32,
      //   },
      //   {
      //     input: '-50 + 100 + -50',
      //     expected: 0,
      //   },
      //   {
      //     input: '5 * 2 + 10',
      //     expected: 20,
      //   },
      //   {
      //     input: '5 + 2 * 10',
      //     expected: 25,
      //   },
      //   {
      //     input: '20 + 2 * -10',
      //     expected: 0,
      //   },
      //   {
      //     input: '50 / 2 * 2 + 10',
      //     expected: 60,
      //   },
      //   {
      //     input: '2 * (5 + 10)',
      //     expected: 30,
      //   },
      //   {
      //     input: '3 * 3 * 3 + 10',
      //     expected: 37,
      //   },
      //   {
      //     input: '3 * (3 * 3) + 10',
      //     expected: 37,
      //   },
      //   {
      //     input: '(5 + 10 * 2 + 15 / 3) * 2 + -10',
      //     expected: 50,
      //   },
    ]

    for (const test of tests) {
      const evaluated = testEval(test.input)
      expect(testIntegerObject(evaluated, test.expected)).toEqual(true)
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
