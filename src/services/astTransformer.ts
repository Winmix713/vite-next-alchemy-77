
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { BabelCompatTypes } from '@/types/conversion';

// Helper function for Babel type compatibility
const babelTypes = t;

export interface AstTransformOptions {
  syntax: 'typescript' | 'javascript';
  preserveComments: boolean;
  target: 'react-vite' | 'react-cra';
}

/**
 * AST-based transformation from Next.js code to React code
 */
export function transformWithAst(
  sourceCode: string,
  options: Partial<AstTransformOptions> = {}
): { code: string; warnings: string[]; changes: string[] } {
  const warnings: string[] = [];
  const changes: string[] = [];
  
  const defaultOptions: AstTransformOptions = {
    syntax: 'typescript',
    preserveComments: true,
    target: 'react-vite'
  };
  
  const opts = { ...defaultOptions, ...options };
  
  try {
    // Parse code to AST
    const ast = parser.parse(sourceCode, {
      sourceType: 'module',
      plugins: [
        opts.syntax === 'typescript' ? 'typescript' : null,
        'jsx',
        'decorators-legacy',
        'classProperties'
      ].filter(Boolean) as parser.ParserPlugin[],
      tokens: true
    });
    
    // Transform Next.js specific imports
    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value as string;
        
        // Transform Next.js imports
        if (source === 'next/image') {
          path.node.source.value = '@unpic/react';
          changes.push('next/image import transformed to @unpic/react import');
        } else if (source === 'next/link') {
          path.node.source.value = 'react-router-dom';
          changes.push('next/link import transformed to react-router-dom import');
        } else if (source === 'next/head') {
          path.node.source.value = 'react-helmet-async';
          changes.push('next/head import transformed to react-helmet-async import');
        } else if (source === 'next/router') {
          path.node.source.value = 'react-router-dom';
          changes.push('next/router import transformed to react-router-dom import');
        } else if (source === 'next/dynamic') {
          // Special case: replace dynamic import with React.lazy
          // Check for dynamic specifier presence
          let hasDynamicSpecifier = false;
          for (const specifier of path.node.specifiers) {
            if ((specifier.type === 'ImportSpecifier' && 
                specifier.imported && 
                ('name' in specifier.imported) && 
                specifier.imported.name === 'dynamic') || 
                specifier.type === 'ImportDefaultSpecifier') {
              hasDynamicSpecifier = true;
              break;
            }
          }
          
          if (hasDynamicSpecifier) {
            // Create new import
            const reactImport = t.importDeclaration(
              [
                t.importSpecifier(t.identifier('lazy'), t.identifier('lazy')),
                t.importSpecifier(t.identifier('Suspense'), t.identifier('Suspense'))
              ],
              t.stringLiteral('react')
            );
            
            // Replace the import declaration
            path.replaceWith(reactImport);
            changes.push('next/dynamic import transformed to React lazy and Suspense import');
          }
        }
      },
      
      // Transform Dynamic imports to React.lazy
      VariableDeclarator(path) {
        // Check if it's a dynamic function call
        if (
          path.node.init && 
          path.node.init.type === 'CallExpression' &&
          path.node.init.callee.type === 'Identifier' && 
          path.node.init.callee.name === 'dynamic'
        ) {
          // Check if dynamic's argument is a function
          if (path.node.init.arguments.length > 0) {
            const arg = path.node.init.arguments[0];
            if (arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression') {
              const dynamicBody = arg.body;
              
              // If the function body is an import() call
              if (
                dynamicBody.type === 'CallExpression' && 
                dynamicBody.callee.type === 'Import'
              ) {
                // Create lazy call
                if (dynamicBody.arguments.length > 0 && 'value' in dynamicBody.arguments[0]) {
                  const importPath = dynamicBody.arguments[0].value;
                  const lazyCall = t.callExpression(
                    t.identifier('lazy'),
                    [
                      t.arrowFunctionExpression(
                        [],
                        t.callExpression(
                          t.identifier('import'),
                          [t.stringLiteral(String(importPath))]
                        )
                      )
                    ]
                  );
                  
                  // Update the init field with lazy call
                  path.node.init = lazyCall;
                  changes.push('dynamic() call transformed to lazy() call');
                }
              }
            }
          }
        }
      },
      
      // Transform getServerSideProps, getStaticProps
      ExportNamedDeclaration(path) {
        if (path.node.declaration) {
          let fnName = '';
          
          if (path.node.declaration.type === 'FunctionDeclaration' && path.node.declaration.id) {
            fnName = path.node.declaration.id.name;
          } else if (
            path.node.declaration.type === 'VariableDeclaration' &&
            path.node.declaration.declarations.length > 0 &&
            path.node.declaration.declarations[0].id &&
            path.node.declaration.declarations[0].id.type === 'Identifier'
          ) {
            fnName = path.node.declaration.declarations[0].id.name;
          }
          
          // Check SSR/SSG function names
          if (['getServerSideProps', 'getStaticProps', 'getStaticPaths'].includes(fnName)) {
            // Determine new hook name
            const reactQueryFnName = fnName === 'getServerSideProps' 
              ? 'useFetchData' 
              : (fnName === 'getStaticProps' ? 'useStaticData' : 'useAvailablePaths');
            
            // Create new hook using parseExpression
            const hookCode = `
              function ${reactQueryFnName}() {
                return useQuery({
                  queryKey: ['${fnName.toLowerCase()}'],
                  queryFn: async () => {
                    // Original ${fnName} logic
                    return { props: {} };
                  }
                });
              }
            `;
            
            const newHookAst = parser.parse(hookCode, {
              sourceType: 'module',
              plugins: ['typescript', 'jsx']
            });
            
            // Extract the first statement (function declaration)
            if (newHookAst.program.body.length > 0) {
              const hookDeclaration = newHookAst.program.body[0];
              
              // Create new export named declaration
              const exportDecl = t.exportNamedDeclaration(
                hookDeclaration as t.Declaration,
                []
              );
              
              // Replace old export with new one
              path.replaceWith(exportDecl);
              
              changes.push(`${fnName} transformed to React Query ${reactQueryFnName} hook`);
            }
          }
        }
      },
      
      // Transform Next.js components
      JSXElement(path) {
        const openingElement = path.node.openingElement;
        const closingElement = path.node.closingElement;
        
        if (openingElement && openingElement.name && openingElement.name.type === 'JSXIdentifier') {
          const tagName = openingElement.name.name;
          
          // Transform Next.js Image component
          if (tagName === 'Image') {
            // Name stays the same (@unpic/react Image)
            
            // Handle src and href attributes
            const newAttributes = openingElement.attributes.filter(attr => {
              if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
                // Skip priority and placeholder attributes
                if (['priority', 'placeholder'].includes(attr.name.name)) {
                  warnings.push(`The '${attr.name.name}' attribute is not supported in @unpic/react library.`);
                  return false;
                }
              }
              return true;
            });
            
            // Check for layout attribute
            let hasLayout = false;
            for (const attr of newAttributes) {
              if (attr.type === 'JSXAttribute' && 
                  attr.name.type === 'JSXIdentifier' && 
                  attr.name.name === 'layout') {
                hasLayout = true;
                break;
              }
            }
            
            // Add layout if not present
            if (!hasLayout) {
              const layoutAttr = t.jsxAttribute(
                t.jsxIdentifier('layout'),
                t.stringLiteral('responsive')
              );
              newAttributes.push(layoutAttr);
            }
            
            // Update attributes
            openingElement.attributes = newAttributes;
            
            changes.push('Next.js Image component transformed to @unpic/react Image component');
          } 
          // Transform Next.js Link component
          else if (tagName === 'Link') {
            // Name stays the same (React Router Link is also Link)
            
            // Transform href attribute to to attribute
            const newAttributes = openingElement.attributes.filter(attr => {
              if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
                // Skip passHref and legacyBehavior attributes
                if (['passHref', 'legacyBehavior'].includes(attr.name.name)) {
                  return false;
                }
                
                // Convert href to to
                if (attr.name.name === 'href') {
                  attr.name.name = 'to';
                }
              }
              return true;
            });
            
            // Update attributes
            openingElement.attributes = newAttributes;
            
            changes.push('Next.js Link component transformed to React Router Link component');
          }
          // Transform Next.js Head component
          else if (tagName === 'Head') {
            openingElement.name.name = 'Helmet';
            
            if (closingElement && closingElement.name.type === 'JSXIdentifier') {
              closingElement.name.name = 'Helmet';
            }
            
            changes.push('Next.js Head component transformed to react-helmet-async Helmet component');
          }
          // Transform Next.js Script component
          else if (tagName === 'Script') {
            openingElement.name.name = 'script';
            
            // Transform strategy attribute
            const newAttributes = openingElement.attributes.filter(attr => {
              if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
                if (attr.name.name === 'strategy') {
                  if (attr.value && 
                      attr.value.type === 'StringLiteral' && 
                      attr.value.value === 'lazyOnload') {
                    // Use defer attribute instead
                    const deferAttr = t.jsxAttribute(
                      t.jsxIdentifier('defer'),
                      t.jsxExpressionContainer(t.booleanLiteral(true))
                    );
                    openingElement.attributes.push(deferAttr);
                  }
                  return false;
                }
              }
              return true;
            });
            
            // Update attributes
            openingElement.attributes = newAttributes;
            
            if (closingElement && closingElement.name.type === 'JSXIdentifier') {
              closingElement.name.name = 'script';
            }
            
            changes.push('Next.js Script component transformed to standard script element');
          }
        }
      },
      
      // Transform router usage
      MemberExpression(path) {
        if (
          path.node.object.type === 'Identifier' &&
          path.node.object.name === 'router'
        ) {
          if (
            path.node.property.type === 'Identifier' &&
            path.node.property.name === 'push'
          ) {
            path.replaceWith(t.identifier('navigate'));
            changes.push('router.push transformed to navigate function call');
          } else if (
            path.node.property.type === 'Identifier' &&
            path.node.property.name === 'query'
          ) {
            path.replaceWith(t.identifier('params'));
            changes.push('router.query transformed to params');
          } else if (
            path.node.property.type === 'Identifier' &&
            (path.node.property.name === 'asPath' || path.node.property.name === 'pathname')
          ) {
            path.replaceWith(
              t.memberExpression(t.identifier('location'), t.identifier('pathname'))
            );
            changes.push('router.pathname/asPath transformed to location.pathname');
          }
        }
      },
      
      // Transform router.replace() to navigate(path, { replace: true })
      CallExpression(path) {
        if (
          path.node.callee.type === 'MemberExpression' &&
          path.node.callee.object.type === 'Identifier' &&
          path.node.callee.object.name === 'router' &&
          path.node.callee.property.type === 'Identifier' &&
          path.node.callee.property.name === 'replace' &&
          path.node.arguments.length > 0
        ) {
          // Create new call expression
          const newCall = t.callExpression(
            t.identifier('navigate'),
            [
              path.node.arguments[0],
              t.objectExpression([
                t.objectProperty(
                  t.identifier('replace'),
                  t.booleanLiteral(true)
                )
              ])
            ]
          );
          
          path.replaceWith(newCall);
          changes.push('router.replace() transformed to navigate(path, { replace: true })');
        }
        
        // Transform router.back() to navigate(-1)
        if (
          path.node.callee.type === 'MemberExpression' &&
          path.node.callee.object.type === 'Identifier' &&
          path.node.callee.object.name === 'router' &&
          path.node.callee.property.type === 'Identifier' &&
          path.node.callee.property.name === 'back'
        ) {
          const newCall = t.callExpression(
            t.identifier('navigate'),
            [t.numericLiteral(-1)]
          );
          
          path.replaceWith(newCall);
          changes.push('router.back() transformed to navigate(-1)');
        }
        
        // Transform useRouter() to React Router hooks
        if (
          path.node.callee.type === 'Identifier' &&
          path.node.callee.name === 'useRouter'
        ) {
          // If this is in a variable declaration, special handling needed
          if (
            path.parent && 
            path.parent.type === 'VariableDeclarator' && 
            path.parent.id.type === 'Identifier' &&
            path.parent.id.name === 'router'
          ) {
            // Find the variable declaration parent
            const varDeclPath = path.findParent(p => p.isVariableDeclaration());
            
            if (varDeclPath) {
              // New hooks code
              const hooksCode = `
                const navigate = useNavigate();
                const params = useParams();
                const location = useLocation();
              `;
              
              const newHooks = parser.parse(hooksCode, {
                sourceType: 'module'
              });
              
              // Find program parent to replace in the body
              const program = path.findParent(p => p.isProgram());
              if (program && program.node.type === 'Program') {
                // Find the variable declaration index
                const declarations = program.node.body;
                for (let i = 0; i < declarations.length; i++) {
                  if (declarations[i] === varDeclPath.node) {
                    // Insert new hooks
                    declarations.splice(i, 1, ...(newHooks.program.body as t.Statement[]));
                    break;
                  }
                }
              }
              
              changes.push('useRouter() hook transformed to useNavigate, useParams and useLocation hooks');
            }
          }
        }
      }
    });
    
    // Generate transformed code
    const output = generate(ast, {
      comments: opts.preserveComments,
      compact: false,
      jsescOption: {
        minimal: true
      }
    });
    
    return {
      code: output.code,
      warnings,
      changes
    };
    
  } catch (error) {
    console.error('AST transformation error:', error);
    warnings.push(`AST transformation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      code: sourceCode,
      warnings,
      changes: []
    };
  }
}

// Export AST transformation API
export const AstTransformer = {
  transform: transformWithAst,
  
  // Helper functions for different types of conversions
  transformNextImage: (code: string) => transformWithAst(code, { preserveComments: true }),
  transformNextLink: (code: string) => transformWithAst(code, { preserveComments: true }),
  transformNextRouter: (code: string) => transformWithAst(code, { preserveComments: true }),
  transformNextHead: (code: string) => transformWithAst(code, { preserveComments: true }),
  transformGetServerSideProps: (code: string) => transformWithAst(code, { preserveComments: true }),
};

/**
 * AST analyzer helper functions for deeper code structure examination
 */
export function analyzeCodeStructure(code: string): {
  imports: string[];
  exports: string[];
  components: string[];
  hooks: string[];
  hasNextImports: boolean;
  hasApiRoutes: boolean;
} {
  const imports: string[] = [];
  const exports: string[] = [];
  const components: string[] = [];
  const hooks: string[] = [];
  let hasNextImports = false;
  let hasApiRoutes = false;
  
  try {
    // AST analysis
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'] as parser.ParserPlugin[],
    });
    
    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value as string;
        imports.push(source);
        
        // Detect Next.js imports
        if (source.startsWith('next/')) {
          hasNextImports = true;
        }
      },
      
      ExportNamedDeclaration(path) {
        if (path.node.declaration) {
          if (path.node.declaration.type === 'FunctionDeclaration' && path.node.declaration.id) {
            exports.push(path.node.declaration.id.name);
            
            // Detect Next.js API routes
            if (path.node.declaration.id.name === 'handler') {
              hasApiRoutes = true;
            }
          } else if (path.node.declaration.type === 'VariableDeclaration') {
            path.node.declaration.declarations.forEach(decl => {
              if (decl.id.type === 'Identifier') {
                exports.push(decl.id.name);
                
                // Detect SSR/SSG functions
                if (['getServerSideProps', 'getStaticProps', 'getStaticPaths'].includes(decl.id.name)) {
                  hasApiRoutes = true;
                }
              }
            });
          }
        }
      },
      
      ExportDefaultDeclaration(path) {
        if (path.node.declaration.type === 'FunctionDeclaration' && path.node.declaration.id) {
          exports.push(path.node.declaration.id.name);
          
          // Detect Next.js API routes
          if (path.node.declaration.id.name === 'handler') {
            hasApiRoutes = true;
          }
        } else if (path.node.declaration.type === 'Identifier') {
          exports.push(path.node.declaration.name);
        }
      },
      
      // Detect React components
      VariableDeclarator(path) {
        if (path.node.id.type === 'Identifier') {
          const name = path.node.id.name;
          
          // If starts with uppercase, it's likely a component
          if (name[0] === name[0].toUpperCase()) {
            // Check if it's JSX or a function returning JSX
            let isComponent = false;
            
            if (path.node.init && (path.node.init.type === 'ArrowFunctionExpression' || path.node.init.type === 'FunctionExpression')) {
              // Lower-level check for JSX elements
              if (path.node.init.body && path.node.init.body.type === 'BlockStatement') {
                const blockStatements = path.node.init.body.body;
                // Check for return JSX
                for (const stmt of blockStatements) {
                  if (stmt.type === 'ReturnStatement' && 
                      stmt.argument && 
                      stmt.argument.type && 
                      typeof stmt.argument.type === 'string' &&
                      stmt.argument.type.includes('JSX')) {
                    isComponent = true;
                    break;
                  }
                }
              } else if (path.node.init.body && 
                         path.node.init.body.type && 
                         typeof path.node.init.body.type === 'string' &&
                         path.node.init.body.type.includes('JSX')) {
                isComponent = true;
              }
            }
            
            if (isComponent) {
              components.push(name);
            }
          }
          
          // Detect hooks (use prefix functions)
          if (name.startsWith('use') && name.length > 3 && name[3] === name[3].toUpperCase()) {
            hooks.push(name);
          }
        }
      },
      
      // Handle function declarations (components and hooks)
      FunctionDeclaration(path) {
        if (path.node.id) {
          const name = path.node.id.name;
          
          // Components (uppercase names)
          if (name[0] === name[0].toUpperCase()) {
            // Check function body for JSX
            let hasJsx = false;
            if (path.node.body && path.node.body.type === 'BlockStatement') {
              const blockStatements = path.node.body.body;
              // Check for return JSX
              for (const stmt of blockStatements) {
                if (stmt.type === 'ReturnStatement' && 
                    stmt.argument && 
                    stmt.argument.type && 
                    typeof stmt.argument.type === 'string' &&
                    stmt.argument.type.includes('JSX')) {
                  hasJsx = true;
                  break;
                }
              }
            }
            
            if (hasJsx) {
              components.push(name);
            }
          }
          
          // Hooks (use prefix functions)
          if (name.startsWith('use') && name.length > 3 && name[3] === name[3].toUpperCase()) {
            hooks.push(name);
          }
        }
      }
    });
    
    return {
      imports,
      exports,
      components,
      hooks,
      hasNextImports,
      hasApiRoutes
    };
    
  } catch (error) {
    console.error('Code structure analysis error:', error);
    return {
      imports: [],
      exports: [],
      components: [],
      hooks: [],
      hasNextImports: false,
      hasApiRoutes: false
    };
  }
}

/**
 * Optimized code transformation for complex Next.js components
 */
export function transformPageComponent(code: string): {
  code: string;
  warnings: string[];
  changes: string[];
  addedImports: string[];
} {
  // Base transformation
  const { code: transformedCode, warnings, changes } = transformWithAst(code);
  
  // Analyze code structure
  const codeStructure = analyzeCodeStructure(transformedCode);
  
  const addedImports: string[] = [];
  
  // Add React Query import if needed
  if (
    changes.some(change => change.includes('React Query')) &&
    !codeStructure.imports.includes('@tanstack/react-query')
  ) {
    addedImports.push('import { useQuery } from "@tanstack/react-query";');
  }
  
  // Add React Router imports if needed
  if (
    changes.some(change => change.includes('React Router')) &&
    !codeStructure.imports.includes('react-router-dom')
  ) {
    addedImports.push('import { useNavigate, useParams, useLocation } from "react-router-dom";');
  }
  
  // Add @unpic/react import if needed
  if (
    changes.some(change => change.includes('@unpic/react')) &&
    !codeStructure.imports.includes('@unpic/react')
  ) {
    addedImports.push('import { Image } from "@unpic/react";');
  }
  
  // Add react-helmet-async import if needed
  if (
    changes.some(change => change.includes('react-helmet-async')) &&
    !codeStructure.imports.includes('react-helmet-async')
  ) {
    addedImports.push('import { Helmet } from "react-helmet-async";');
  }
  
  // Add React Suspense import if needed
  if (
    changes.some(change => change.includes('React lazy')) &&
    !codeStructure.imports.includes('react')
  ) {
    addedImports.push('import { lazy, Suspense } from "react";');
  }
  
  // Add imports to transformed code
  const result = addedImports.join('\n') + '\n\n' + transformedCode;
  
  return {
    code: result,
    warnings,
    changes,
    addedImports
  };
}
