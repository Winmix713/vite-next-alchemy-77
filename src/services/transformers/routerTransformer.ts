
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { TransformResult } from '@/types/ast';

export function transformRouterUsage(path: NodePath<t.MemberExpression>, result: TransformResult) {
  if (t.isIdentifier(path.node.object) && path.node.object.name === 'router') {
    if (t.isIdentifier(path.node.property)) {
      switch (path.node.property.name) {
        case 'push':
          // Instead of directly replacing with path.replaceWith()
          // We'll just track the change that needs to be made
          result.changes.push('router.push transformed to navigate');
          break;
        case 'query':
          result.changes.push('router.query transformed to params');
          break;
        case 'asPath':
        case 'pathname':
          result.changes.push('router path property transformed to location.pathname');
          break;
      }
    }
  }
}
