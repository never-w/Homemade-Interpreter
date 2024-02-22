import { newToken } from '../helpers/helpers'

export const TokenTypes = {
  IDENT: 'IDENT',
  INT: 'INT',

  ASSIGN: '=',
  PLUS: '+',
  MINUS: '-',
  BANG: '!',
  ASTERISK: '*',
  SLASH: '/',

  LT: '<',
  GT: '>',

  EQ: '==',
  NOT_EQ: '!=',

  COMMA: ',',
  SEMICOLON: ';',

  LPAREN: '(',
  RPAREN: ')',
  LBRACE: '{',
  RBRACE: '}',

  FUNCTION: 'FUNCTION',
  LET: 'LET',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  IF: 'IF',
  ELSE: 'ELSE',
  RETURN: 'RETURN',

  /** 非法的  */
  ILLEGAL: 'ILLEGAL',
  /** End Of File */
  EOF: 'EOF',
} as const

const keywords = {
  fn: newToken(TokenTypes.FUNCTION, 'fn'),
  let: newToken(TokenTypes.LET, 'let'),
  true: newToken(TokenTypes.TRUE, 'true'),
  false: newToken(TokenTypes.FALSE, 'false'),
  if: newToken(TokenTypes.IF, 'if'),
  else: newToken(TokenTypes.ELSE, 'else'),
  return: newToken(TokenTypes.RETURN, 'return'),
} as const

type ValueOf<T> = T[keyof T]
export type TokenType = ValueOf<typeof TokenTypes>

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
