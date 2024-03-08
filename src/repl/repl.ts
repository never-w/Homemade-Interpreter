import readline from 'readline'
import { Lexer } from '../lexer/lexer'
import { TokenTypes } from '../token/token'
import { Parser } from '../parser/parser'

const MONKEY_FACE = `            __,__
   .--.  .-"     "-.  .--.
  / .. \/  .-. .-.  \/ .. \
 | |  '|  /   Y   \  |'  | |
 | \   \  \ 0 | 0 /  /   / |
  \ '- ,\.-"""""""-./, -' /
   ''-' /_   ^ ^   _\ '-''
       |  \._   _./  |
       \   \ '~' /   /
        '._ '-=-' _.'
           '-----'
`

const repl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '->',
})

repl.prompt()

repl.on('line', (input) => {
  const lexer = Lexer.newLexer(input)
  const parser = Parser.newParser(lexer)
  const program = parser.parseProgram()
  if (parser.getErrors().length) {
    printParseErrors(parser.getErrors())
  }

  console.log(program.string())
  repl.prompt()
})

repl.on('close', () => {
  console.log('Have a nice day!')
  process.exit(0)
})

function printParseErrors(errors: string[]) {
  console.error(MONKEY_FACE)
  console.error('Woops! we ran into some monkey business here!')
  console.error(' parser errors:')
  for (const err of errors) {
    console.log(`\t ${err}`)
  }
}
