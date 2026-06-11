import ts from "typescript";
import { evaluate } from "../const-enum/utils";

export const tsInlineConstEnums = (program: ts.Program) => {
  const typeChecker = program.getTypeChecker();
  function transformNodeAndChildren(node: ts.SourceFile, ctx: ts.TransformationContext): ts.SourceFile;
  function transformNodeAndChildren(node: ts.Node, ctx: ts.TransformationContext): ts.Node;
  function transformNodeAndChildren(node: ts.Node, ctx: ts.TransformationContext): ts.Node {
    return ts.visitEachChild(
      transformNode(node),
      (childNode: ts.Node) => transformNodeAndChildren(childNode, ctx),
      ctx,
    );
  }
  function transformNode(node: ts.Node): ts.Node {
    if (ts.isPropertyAccessExpression(node)) {
      const tp2 = typeChecker.getTypeAtLocation(node.expression);
      if (tp2 && tp2.symbol && tp2.symbol.flags & ts.SymbolFlags.ConstEnum) {
        // console.info("CONST ENUM!");
        const tp = typeChecker.getTypeAtLocation(node.name);
        if (tp && tp.symbol) {
          if (tp.symbol.flags & ts.SymbolFlags.EnumMember) {
            // console.info("CONST MEMBER!");
            if (tp.symbol.valueDeclaration) {
              if (ts.isEnumMember(tp.symbol.valueDeclaration)) {
                const init = tp.symbol.valueDeclaration?.initializer;
                if (init) {
                  const newNode = getConstantValue(init);
                  if (newNode) {
                    // console.info("INLINE " + node.getText() + " => " + init.getText());
                    return newNode;
                  } else {
                    console.warn("failed to create initializer for ", init.getText());
                  }
                } else {
                  console.warn("miss initializer for ", node.getText());
                  // console.info(tp.symbol.valueDeclaration);
                  // throw new Error("sasd");
                }
              }
            }
          }
        }
      }
    }
    return node;
  }

  return (ctx: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => transformNodeAndChildren(sourceFile, ctx);
  };
};

function getConstantValue(expression: ts.Expression | null | undefined) {
  if (!expression) {
    return null;
  }
  // case: -x
  if (ts.isPrefixUnaryExpression(expression)) {
    return ts.factory.createPrefixUnaryExpression(expression.operator, getConstantValue(expression.operand));
  } else if (ts.isStringLiteralLike(expression)) {
    return ts.factory.createStringLiteral(expression.text);
  } else if (ts.isNumericLiteral(expression)) {
    return ts.factory.createNumericLiteral(expression.text);
  } else if (
    expression.kind === ts.SyntaxKind.TrueKeyword ||
    expression.kind === ts.SyntaxKind.FalseKeyword ||
    expression.kind === ts.SyntaxKind.NullKeyword
  ) {
    return ts.factory.createToken(expression.kind);
  } else {
    try {
      const result = evaluate(expression, new Map());
      if (typeof result === "string") {
        return ts.factory.createStringLiteral(result);
      } else if (typeof result === "number") {
        return ts.factory.createNumericLiteral(result.toString());
      }
    } catch {
      // ignore
    }
  }
  return null;
}
