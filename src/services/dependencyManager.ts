
interface DependencyChange {
  name: string;
  oldVersion?: string;
  newVersion?: string;
  action: 'add' | 'remove' | 'update';
}

export function analyzeDependencies(packageJson: any): DependencyChange[] {
  const changes: DependencyChange[] = [];
  
  // Check for Next.js specific dependencies
  if (packageJson.dependencies?.['next']) {
    changes.push({
      name: 'next',
      oldVersion: packageJson.dependencies['next'],
      action: 'remove'
    });
    
    // Add Vite related dependencies
    changes.push({
      name: '@vitejs/plugin-react',
      newVersion: 'latest',
      action: 'add'
    });
  }

  // Handle routing dependencies
  if (!packageJson.dependencies?.['react-router-dom']) {
    changes.push({
      name: 'react-router-dom',
      newVersion: 'latest',
      action: 'add'
    });
  }

  return changes;
}

export function generatePackageJsonUpdates(changes: DependencyChange[]): string {
  const updates = changes.map(change => {
    switch (change.action) {
      case 'add':
        return `+ ${change.name}@${change.newVersion}`;
      case 'remove':
        return `- ${change.name}`;
      case 'update':
        return `~ ${change.name}: ${change.oldVersion} -> ${change.newVersion}`;
    }
  });

  return updates.join('\n');
}
