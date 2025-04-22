
interface TransformationRule {
  pattern: RegExp;
  replacement: string;
  description: string;
}

export const nextToViteTransformations: TransformationRule[] = [
  {
    pattern: /import\s+{\s*GetServerSideProps\s*}\s+from\s+'next'/g,
    replacement: "// Vite equivalent not needed - use React Query or similar",
    description: "Remove Next.js SSR imports"
  },
  {
    pattern: /export\s+const\s+getServerSideProps\s*=/g,
    replacement: "// Converted to React Query\nexport const fetchData =",
    description: "Convert SSR to client-side fetching"
  },
  {
    pattern: /import\s+{\s*useRouter\s*}\s+from\s+'next\/router'/g,
    replacement: "import { useNavigate, useParams } from 'react-router-dom'",
    description: "Replace Next.js router with React Router"
  },
  {
    pattern: /const\s+router\s*=\s*useRouter\(\)/g,
    replacement: "const navigate = useNavigate()\nconst params = useParams()",
    description: "Update router usage"
  }
];

export function transformCode(sourceCode: string): {
  transformedCode: string;
  appliedTransformations: string[];
} {
  const appliedTransformations: string[] = [];
  let transformedCode = sourceCode;

  for (const rule of nextToViteTransformations) {
    if (rule.pattern.test(transformedCode)) {
      transformedCode = transformedCode.replace(rule.pattern, rule.replacement);
      appliedTransformations.push(rule.description);
    }
  }

  return {
    transformedCode,
    appliedTransformations
  };
}
