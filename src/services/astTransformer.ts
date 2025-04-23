
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import { AstTransformOptions, TransformResult } from '@/types/ast';
import { transformImports } from './transformers/importTransformer';
import { transformJSXElement } from './transformers/componentTransformer';
import { transformRouterUsage } from './transformers/routerTransformer';

export function transformWithAst(
  sourceCode: string,
  options: Partial<AstTransformOptions> = {}
): TransformResult {
  const result: TransformResult = {
    code: sourceCode,
    warnings: [],
    changes: []
  };

  try {
    const ast = parser.parse(sourceCode, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      ImportDeclaration(path) {
        transformImports(path, result);
      },
      JSXElement(path) {
        transformJSXElement(path, result);
      },
      MemberExpression(path) {
        transformRouterUsage(path, result);
      }
    });

    const output = generate(ast, {
      comments: options.preserveComments !== false,
      compact: false
    });

    return { ...result, code: output.code };
  } catch (error) {
    result.warnings.push(`AST transformation error: ${error instanceof Error ? error.message : String(error)}`);
    return result;
  }
}
