
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { TransformResult } from '@/types/ast';

export function transformJSXElement(path: NodePath<t.JSXElement>, result: TransformResult) {
  const openingElement = path.node.openingElement;
  const closingElement = path.node.closingElement;

  if (t.isJSXIdentifier(openingElement.name)) {
    const tagName = openingElement.name.name;

    switch (tagName) {
      case 'Head':
        openingElement.name.name = 'Helmet';
        if (closingElement?.name && t.isJSXIdentifier(closingElement.name)) {
          closingElement.name.name = 'Helmet';
        }
        result.changes.push('Next.js Head component transformed to Helmet');
        break;

      case 'Image':
        // Transform Image component attributes
        const newAttributes = openingElement.attributes.filter(attr => {
          if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
            return !['priority', 'placeholder'].includes(attr.name.name);
          }
          return true;
        });
        openingElement.attributes = newAttributes;
        result.changes.push('Next.js Image component transformed');
        break;
    }
  }
}
