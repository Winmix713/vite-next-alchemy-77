
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowDown } from "lucide-react";
import CodePreview from "@/components/CodePreview";

interface ConversionDashboardProps {
  projectData: any;
  onStartConversion: () => void;
  isConverting: boolean;
}

const ConversionDashboard = ({ 
  projectData, 
  onStartConversion,
  isConverting 
}: ConversionDashboardProps) => {
  const [options, setOptions] = useState({
    useReactRouter: true,
    convertApiRoutes: true,
    transformDataFetching: true,
    replaceComponents: true,
    updateDependencies: true,
    preserveTypeScript: true
  });

  const toggleOption = (option: keyof typeof options) => {
    setOptions({ ...options, [option]: !options[option] });
  };

  const getComplexityLabel = (score: number) => {
    if (score < 30) return { label: "Easy", color: "bg-green-100 text-green-800" };
    if (score < 60) return { label: "Moderate", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Complex", color: "bg-red-100 text-red-800" };
  };

  const complexityInfo = getComplexityLabel(projectData.complexityScore);

  // Mock data for previews
  const beforeCode = `// pages/index.js
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Layout from '../components/layout'

export default function Home({ posts }) {
  const router = useRouter()
  
  return (
    <Layout>
      <Head>
        <title>My Next.js Blog</title>
      </Head>
      <div className="grid">
        {posts.map(post => (
          <div key={post.id} onClick={() => router.push(\`/posts/\${post.slug}\`)}>
            <Image 
              src={post.image} 
              alt={post.title} 
              width={300} 
              height={200} 
            />
            <h2>{post.title}</h2>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export async function getStaticProps() {
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()
  return { props: { posts } }
}`;

  const afterCode = `// src/pages/Home.jsx
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout'

export default function Home() {
  const navigate = useNavigate()
  
  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('https://api.example.com/posts')
      return res.json()
    }
  })
  
  return (
    <Layout>
      <div className="grid">
        {posts?.map(post => (
          <div key={post.id} onClick={() => navigate(\`/posts/\${post.slug}\`)}>
            <img 
              src={post.image} 
              alt={post.title} 
              width={300} 
              height={200} 
              loading="lazy"
            />
            <h2>{post.title}</h2>
          </div>
        ))}
      </div>
    </Layout>
  )
}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <Card className="w-full md:w-3/4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Analysis Results</CardTitle>
                <CardDescription>Your Next.js project analysis summary</CardDescription>
              </div>
              <Badge className={complexityInfo.color}>
                {complexityInfo.label} Conversion
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-sm text-gray-500">Total Files</div>
                <div className="text-2xl font-semibold">{projectData.totalFiles}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-sm text-gray-500">Next.js Components</div>
                <div className="text-2xl font-semibold">{projectData.nextJsComponents}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-sm text-gray-500">API Routes</div>
                <div className="text-2xl font-semibold">{projectData.apiRoutes}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-sm text-gray-500">Data Fetching Methods</div>
                <div className="text-2xl font-semibold">{projectData.dataFetchingMethods}</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Complexity Score</h3>
              <div className="flex items-center gap-2">
                <Progress value={projectData.complexityScore} className="h-2" />
                <span className="text-sm font-medium">{projectData.complexityScore}/100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full md:w-1/4">
          <CardHeader>
            <CardTitle>Conversion Options</CardTitle>
            <CardDescription>Customize your migration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="useReactRouter" className="text-sm font-medium">
                Use React Router
              </label>
              <Switch
                id="useReactRouter"
                checked={options.useReactRouter}
                onCheckedChange={() => toggleOption('useReactRouter')}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="convertApiRoutes" className="text-sm font-medium">
                Convert API Routes
              </label>
              <Switch
                id="convertApiRoutes"
                checked={options.convertApiRoutes}
                onCheckedChange={() => toggleOption('convertApiRoutes')}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="transformDataFetching" className="text-sm font-medium">
                Transform Data Fetching
              </label>
              <Switch
                id="transformDataFetching"
                checked={options.transformDataFetching}
                onCheckedChange={() => toggleOption('transformDataFetching')}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="replaceComponents" className="text-sm font-medium">
                Replace Components
              </label>
              <Switch
                id="replaceComponents"
                checked={options.replaceComponents}
                onCheckedChange={() => toggleOption('replaceComponents')}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="updateDependencies" className="text-sm font-medium">
                Update Dependencies
              </label>
              <Switch
                id="updateDependencies"
                checked={options.updateDependencies}
                onCheckedChange={() => toggleOption('updateDependencies')}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="preserveTypeScript" className="text-sm font-medium">
                Preserve TypeScript
              </label>
              <Switch
                id="preserveTypeScript"
                checked={options.preserveTypeScript}
                onCheckedChange={() => toggleOption('preserveTypeScript')}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={onStartConversion}
              disabled={isConverting}
            >
              {isConverting ? "Converting..." : "Start Conversion"}
              {!isConverting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Code Preview</CardTitle>
          <CardDescription>See how your code will be converted</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="home-page">
            <TabsList className="mb-4">
              <TabsTrigger value="home-page">Home Page</TabsTrigger>
              <TabsTrigger value="api-route">API Route</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="home-page" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CodePreview title="Next.js" code={beforeCode} />
                <div className="hidden lg:flex items-center justify-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <ArrowRight className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex lg:hidden items-center justify-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <ArrowDown className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <CodePreview title="Vite + React Router" code={afterCode} />
              </div>
            </TabsContent>
            
            <TabsContent value="api-route">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CodePreview 
                  title="Next.js API Route" 
                  code={`// pages/api/posts.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ posts: [...] })
  } else if (req.method === 'POST') {
    const { title, content } = req.body
    // Create post
    res.status(201).json({ message: 'Created' })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(\`Method \${req.method} Not Allowed\`)
  }
}`} 
                />
                <div className="hidden lg:flex items-center justify-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <ArrowRight className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex lg:hidden items-center justify-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <ArrowDown className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <CodePreview 
                  title="Express API Route" 
                  code={`// server/routes/posts.js
import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).json({ posts: [...] })
})

router.post('/', (req, res) => {
  const { title, content } = req.body
  // Create post
  res.status(201).json({ message: 'Created' })
})

export default router

// server/index.js
import express from 'express'
import postsRouter from './routes/posts.js'

const app = express()
app.use(express.json())
app.use('/api/posts', postsRouter)

app.listen(3001, () => {
  console.log('API server running on port 3001')
})`} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="config">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CodePreview 
                  title="Next.js Config" 
                  code={`// next.config.js
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['images.example.com'],
  },
  env: {
    API_URL: process.env.API_URL
  },
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  }
}`} 
                />
                <div className="hidden lg:flex items-center justify-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <ArrowRight className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex lg:hidden items-center justify-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <ArrowDown className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <CodePreview 
                  title="Vite Config" 
                  code={`// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
  },
  define: {
    'import.meta.env.API_URL': JSON.stringify(process.env.API_URL),
  },
  // Added with external i18n plugin like i18next
  // i18n configured separately
})`} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isConverting && (
        <Card>
          <CardHeader>
            <CardTitle>Converting Your Project</CardTitle>
            <CardDescription>Converting Next.js to Vite</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Processing files...</span>
                  <span>67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              
              <div className="bg-gray-50 p-3 rounded border text-sm font-mono text-gray-700 h-32 overflow-y-auto">
                <div className="text-green-600">✓ Analyzing project structure</div>
                <div className="text-green-600">✓ Creating vite.config.js</div>
                <div className="text-green-600">✓ Setting up React Router</div>
                <div className="text-green-600">✓ Converting pages to routes</div>
                <div className="text-green-600">✓ Transforming data fetching methods</div>
                <div className="text-blue-600">→ Replacing Next.js components...</div>
                <div className="text-gray-500">• Converting API routes</div>
                <div className="text-gray-500">• Updating package.json</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConversionDashboard;
