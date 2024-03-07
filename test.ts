import { Lexer } from './src/lexer/lexer'
import { Parser } from './src/parser/parser'

const input = '1+(2+3) + 8'

const lexer = Lexer.newLexer(input as string)
const parser = Parser.newParser(lexer)
const program = parser.parseProgram()

console.log(program.statements[0].string())
