interface TransformationRule {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: any[]) => string);
  description: string;
  complexity: 'simple' | 'medium' | 'complex';
}

export const nextToViteTransformations: TransformationRule[] = [
  // Alap Next.js SSR átalakítások
  {
    pattern: /import\s+{\s*GetServerSideProps\s*(?:,\s*[^}]+)?\s*}\s+from\s+'next'/g,
    replacement: "// Vite equivalent not needed - use React Query or similar",
    description: "Remove Next.js SSR imports",
    complexity: 'simple'
  },
  {
    pattern: /export\s+const\s+getServerSideProps\s*=\s*async\s*\(\s*(?:context)?\s*\)\s*=>\s*{([^}]*)}/gs,
    replacement: (match, funcBody) => {
      return `// Converted to React Query fetch function
export const fetchData = async () => {
  // Original getServerSideProps logic:
  ${funcBody}
}`;
    },
    description: "Convert SSR getServerSideProps to client-side fetching",
    complexity: 'medium'
  },
  {
    pattern: /export\s+const\s+getStaticProps\s*=\s*async\s*\(\s*(?:context)?\s*\)\s*=>\s*{([^}]*)}/gs,
    replacement: (match, funcBody) => {
      return `// Converted to React Query fetch function
export const fetchStaticData = async () => {
  // Original getStaticProps logic:
  ${funcBody}
}`;
    },
    description: "Convert SSR getStaticProps to client-side fetching",
    complexity: 'medium'
  },
  {
    pattern: /export\s+const\s+getStaticPaths\s*=\s*async\s*\(\s*\)\s*=>\s*{([^}]*)}/gs,
    replacement: (match, funcBody) => {
      return `// Converted to React Router compatible function
export const getAvailablePaths = async () => {
  // Original getStaticPaths logic:
  ${funcBody}
}`;
    },
    description: "Convert SSR getStaticPaths",
    complexity: 'medium'
  },

  // Next.js router átalakítások
  {
    pattern: /import\s+{\s*useRouter\s*(?:,\s*[^}]+)?\s*}\s+from\s+'next\/router'/g,
    replacement: "import { useNavigate, useParams, useLocation } from 'react-router-dom'",
    description: "Replace Next.js router with React Router",
    complexity: 'simple'
  },
  {
    pattern: /const\s+router\s*=\s*useRouter\(\)/g,
    replacement: "const navigate = useNavigate()\nconst params = useParams()\nconst location = useLocation()",
    description: "Update router usage",
    complexity: 'simple'
  },
  {
    pattern: /router\.push\((['"`])([^'"`]+)(['"`])\)/g,
    replacement: "navigate($1$2$3)",
    description: "Convert router.push to navigate",
    complexity: 'simple'
  },
  {
    pattern: /router\.replace\((['"`])([^'"`]+)(['"`])\)/g,
    replacement: "navigate($1$2$3, { replace: true })",
    description: "Convert router.replace to navigate with replace",
    complexity: 'simple'
  },
  {
    pattern: /router\.query\.(\w+)/g,
    replacement: "params.$1",
    description: "Convert router.query to useParams",
    complexity: 'simple'
  },
  {
    pattern: /router\.asPath/g,
    replacement: "location.pathname",
    description: "Convert router.asPath to location.pathname",
    complexity: 'simple'
  },
  {
    pattern: /router\.pathname/g,
    replacement: "location.pathname",
    description: "Convert router.pathname to location.pathname",
    complexity: 'simple'
  },
  {
    pattern: /router\.back\(\)/g,
    replacement: "navigate(-1)",
    description: "Convert router.back to navigate(-1)",
    complexity: 'simple'
  },

  // Next.js Image komponens átalakítás
  {
    pattern: /import\s+Image\s+from\s+['"]next\/image['"]/g,
    replacement: "// Using standard <img> tag instead of Next.js Image\nimport { optimizeImage } from '../utils/imageUtils'",
    description: "Replace Next.js Image with standard img",
    complexity: 'medium'
  },
  {
    pattern: /<Image\s+([^>]*)\s*src=(['"]{1})([^'"]+)(['"]{1})\s+([^>]*)>/g,
    replacement: "<img $1 src={optimizeImage($2$3$4)} $5>",
    description: "Convert Next.js Image to img with optimization utility",
    complexity: 'complex'
  },

  // Next.js Head komponens helyettesítése
  {
    pattern: /import\s+Head\s+from\s+['"]next\/head['"]/g,
    replacement: "import { Helmet } from 'react-helmet-async'",
    description: "Replace Next.js Head with react-helmet-async",
    complexity: 'simple'
  },
  {
    pattern: /<Head>([\s\S]*?)<\/Head>/g,
    replacement: "<Helmet>$1</Helmet>",
    description: "Convert Head component to Helmet component",
    complexity: 'medium'
  },

  // Next.js Dynamic import átalakítás
  {
    pattern: /import\s+dynamic\s+from\s+['"]next\/dynamic['"]/g,
    replacement: "import { lazy, Suspense } from 'react'",
    description: "Replace Next.js dynamic with React.lazy",
    complexity: 'simple'
  },
  {
    pattern: /const\s+(\w+)\s*=\s*dynamic\(\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)\)/g,
    replacement: "const $1 = lazy(() => import('$2'))",
    description: "Convert dynamic import syntax",
    complexity: 'medium'
  },
  {
    pattern: /import\s+{\s*useRouter\s*}\s+from\s+['"]next\/router['"]/g,
    replacement: "import { useNavigate, useParams, useLocation } from 'react-router-dom'",
    description: "Replace Next.js router with React Router",
    complexity: 'simple'
  },
  {
    pattern: /const\s+router\s*=\s*useRouter\(\)/g,
    replacement: "const navigate = useNavigate()\nconst params = useParams()\nconst location = useLocation()",
    description: "Convert router hooks",
    complexity: 'medium'
  },
  {
    pattern: /import\s+Image\s+from\s+['"]next\/image['"]/g,
    replacement: "import { Image } from '@unpic/react'",
    description: "Replace Next.js Image with @unpic/react",
    complexity: 'simple'
  },
  {
    pattern: /<Image\s+([^>]*)src=(['"])(.*?)\2([^>]*)>/g,
    replacement: "<Image $1src={$2$3$2} layout='fill' $4>",
    description: "Convert Image component props",
    complexity: 'complex'
  },

  // API Routes átalakítás
  {
    pattern: /export\s+default\s+function\s+handler\s*\(req,\s*res\)\s*{([^}]*)}/gs,
    replacement: (match, funcBody) => {
      return `// API route converted to Vite-compatible endpoint
// Consider using backend services like Supabase, Firebase, or Express
// Example with Express:
// app.post('/api/your-endpoint', (req, res) => {
${funcBody}
// });`;
    },
    description: "Convert Next.js API routes to alternative backend options",
    complexity: 'complex'
  },

  // Config átalakítások
  {
    pattern: /next\.config\.js/g,
    replacement: "vite.config.js",
    description: "Replace Next.js config references to Vite config",
    complexity: 'simple'
  }
];

// A végső transzformációs függvény
export function transformCode(sourceCode: string): {
  transformedCode: string;
  appliedTransformations: string[];
} {
  const appliedTransformations: string[] = [];
  let transformedCode = sourceCode;

  for (const rule of nextToViteTransformations) {
    if (rule.pattern.test(transformedCode)) {
      if (typeof rule.replacement === 'string') {
        transformedCode = transformedCode.replace(rule.pattern, rule.replacement);
      } else if (typeof rule.replacement === 'function') {
        transformedCode = transformedCode.replace(rule.pattern, rule.replacement as (substring: string, ...args: any[]) => string);
      }
      appliedTransformations.push(rule.description);
    }
  }

  return {
    transformedCode,
    appliedTransformations
  };
}

// Új API funkciók a transzformációs modul kibővítéséhez

// Prioritások alapján rendezett transzformációs szabályok
export function getTransformationsByComplexity(complexity: 'simple' | 'medium' | 'complex' | 'all' = 'all'): TransformationRule[] {
  if (complexity === 'all') {
    return nextToViteTransformations;
  }
  
  return nextToViteTransformations.filter(rule => rule.complexity === complexity);
}

interface TransformationStats {
  totalRules: number;
  appliedRules: number;
  modificationRate: number;
  complexity: {
    simple: number;
    medium: number;
    complex: number;
  };
}

// Statisztika generálás a transzformációkról
export function getTransformationStats(sourceCode: string): TransformationStats {
  let simple = 0;
  let medium = 0;
  let complex = 0;
  
  const appliedRules = nextToViteTransformations.filter(rule => {
    const applied = rule.pattern.test(sourceCode);
    if (applied) {
      if (rule.complexity === 'simple') simple++;
      if (rule.complexity === 'medium') medium++;
      if (rule.complexity === 'complex') complex++;
    }
    return applied;
  });
  
  return {
    totalRules: nextToViteTransformations.length,
    appliedRules: appliedRules.length,
    modificationRate: appliedRules.length / nextToViteTransformations.length,
    complexity: {
      simple,
      medium,
      complex
    }
  };
}
