import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { TransformResult } from '@/types/ast';

export function transformHeadComponent(path: NodePath<t.JSXElement>, result: TransformResult) {
  const openingElement = path.node.openingElement;
  const closingElement = path.node.closingElement;
  
  if (t.isJSXIdentifier(openingElement.name) && openingElement.name.name === 'Head') {
    // Rename the component from Head to Helmet
    openingElement.name.name = 'Helmet';
    
    if (closingElement?.name && t.isJSXIdentifier(closingElement.name)) {
      closingElement.name.name = 'Helmet';
    }
    
    // Add a change notification
    result.changes.push('Next.js Head component transformed to React Helmet');
    
    // Handle title and meta tags if needed
    path.traverse({
      JSXElement(childPath) {
        const childOpeningElement = childPath.node.openingElement;
        if (t.isJSXIdentifier(childOpeningElement.name)) {
          if (childOpeningElement.name.name === 'title' || childOpeningElement.name.name === 'meta') {
            // Keep these elements as they work in both Next.js Head and react-helmet
            result.changes.push(`Preserved ${childOpeningElement.name.name} element in Head/Helmet`);
          }
        }
      }
    });
  }
}
