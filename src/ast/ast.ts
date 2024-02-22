export interface ASTNode {
  tokenLiteral(): string
  string(): string
}

export interface Statement extends ASTNode {
  statementNode(): void
}

export interface Expression extends ASTNode {
  expressionNode(): void
}
