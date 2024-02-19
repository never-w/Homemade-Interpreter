import { newToken } from '../helpers/helpers'

export const TokenTypes = {
  IDENT: 'IDENT',
  INT: 'INT',

  ASSIGN: '=',
  PLUS: '+',

  COMMA: ',',
  SEMICOLON: ';',

  LPAREN: '(',
  RPAREN: ')',
  LBRACE: '{',
  RBRACE: '}',

  FUNCTION: 'FUNCTION',
  LET: 'LET',

  ILLEGAL: 'ILLEGAL',
  EOF: 'EOF',
} as const

const keywords = {
  fn: newToken(TokenTypes.FUNCTION, 'fn'),
  let: newToken(TokenTypes.LET, 'let'),
} as const

export type TokenType = (typeof TokenTypes)[keyof typeof TokenTypes]

export type Token = {
  type: TokenType
  literal: string
}

export function lookupIdent(ident: string): TokenType {
  const keyword = keywords[ident as keyof typeof keywords]
  if (keyword) {
    return keyword.type
  }

  return TokenTypes.IDENT
}
