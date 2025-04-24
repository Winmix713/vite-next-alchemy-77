
import { Project, ConversionHistory, Comment, CollaboratorInfo, UserProfile } from '@/types/conversion';
import { ConversionMetrics } from '@/types/analyzer';

export class ProjectService {
  private static instance: ProjectService;
  private projects: Project[] = [];
  private history: ConversionHistory[] = [];
  private comments: Comment[] = [];

  private constructor() {
    // Load projects from local storage
    try {
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        this.projects = JSON.parse(savedProjects);
      }

      const savedHistory = localStorage.getItem('conversionHistory');
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }

      const savedComments = localStorage.getItem('comments');
      if (savedComments) {
        this.comments = JSON.parse(savedComments);
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  }

  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  // Save data to local storage
  private saveData(): void {
    try {
      localStorage.setItem('projects', JSON.stringify(this.projects));
      localStorage.setItem('conversionHistory', JSON.stringify(this.history));
      localStorage.setItem('comments', JSON.stringify(this.comments));
    } catch (error) {
      console.error('Failed to save project data:', error);
    }
  }

  // Project methods
  public async createProject(name: string, description: string, ownerId: string): Promise<Project> {
    const newProject: Project = {
      id: `proj_${Math.random().toString(36).substring(2, 11)}`,
      name,
      description,
      ownerId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft',
      stats: {
        filesCount: 0,
        conversionRate: 0
      }
    };

    this.projects.push(newProject);
    this.saveData();
    return newProject;
  }

  public async getProjects(userId: string): Promise<Project[]> {
    return this.projects.filter(
      project => project.ownerId === userId || 
      project.collaborators?.some(c => c.userId === userId)
    );
  }

  public async getProjectById(projectId: string): Promise<Project | null> {
    const project = this.projects.find(p => p.id === projectId);
    return project || null;
  }

  public async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const index = this.projects.findIndex(p => p.id === projectId);
    if (index === -1) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...this.projects[index],
      ...updates,
      updatedAt: Date.now()
    };

    this.projects[index] = updatedProject;
    this.saveData();
    return updatedProject;
  }

  public async deleteProject(projectId: string): Promise<boolean> {
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== projectId);
    
    // Also remove related history and comments
    this.history = this.history.filter(h => h.projectId !== projectId);
    this.comments = this.comments.filter(c => c.projectId !== projectId);
    
    this.saveData();
    return this.projects.length < initialLength;
  }

  // Collaborator methods
  public async addCollaborator(
    projectId: string, 
    userId: string, 
    displayName: string, 
    role: 'viewer' | 'editor' | 'admin' = 'viewer',
    avatarUrl?: string
  ): Promise<Project> {
    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const newCollaborator: CollaboratorInfo = {
      userId,
      displayName,
      avatarUrl,
      role,
      addedAt: Date.now()
    };

    const collaborators = project.collaborators || [];
    // Check if user is already a collaborator
    const existingIndex = collaborators.findIndex(c => c.userId === userId);
    
    if (existingIndex >= 0) {
      collaborators[existingIndex] = newCollaborator;
    } else {
      collaborators.push(newCollaborator);
    }

    return this.updateProject(projectId, { 
      collaborators,
      updatedAt: Date.now()
    });
  }

  public async removeCollaborator(projectId: string, userId: string): Promise<Project> {
    const project = await this.getProjectById(projectId);
    if (!project || !project.collaborators) {
      throw new Error('Project or collaborator not found');
    }

    const collaborators = project.collaborators.filter(c => c.userId !== userId);
    
    return this.updateProject(projectId, { 
      collaborators,
      updatedAt: Date.now()
    });
  }

  // Conversion History methods
  public async addConversionHistory(
    projectId: string,
    userId: string,
    conversionOptions: any,
    metrics: ConversionMetrics
  ): Promise<ConversionHistory> {
    const historyItem: ConversionHistory = {
      id: `hist_${Math.random().toString(36).substring(2, 11)}`,
      projectId,
      userId,
      timestamp: Date.now(),
      conversionOptions,
      metrics
    };

    this.history.push(historyItem);
    
    // Update project stats with the latest conversion
    const project = await this.getProjectById(projectId);
    if (project) {
      await this.updateProject(projectId, {
        stats: {
          ...project.stats,
          conversionRate: metrics.successRate,
          lastConversion: metrics,
          filesCount: metrics.filesProcessed
        },
        status: metrics.successRate === 100 ? 'completed' : 'in_progress',
        updatedAt: Date.now()
      });
    }
    
    this.saveData();
    return historyItem;
  }

  public async getProjectHistory(projectId: string): Promise<ConversionHistory[]> {
    return this.history
      .filter(h => h.projectId === projectId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Comment methods
  public async addComment(
    projectId: string,
    userId: string,
    userDisplayName: string,
    content: string,
    filePath?: string,
    lineNumber?: number,
    userAvatarUrl?: string
  ): Promise<Comment> {
    const comment: Comment = {
      id: `comment_${Math.random().toString(36).substring(2, 11)}`,
      projectId,
      userId,
      userDisplayName,
      userAvatarUrl,
      content,
      timestamp: Date.now(),
      filePath,
      lineNumber,
      resolved: false
    };

    this.comments.push(comment);
    this.saveData();
    return comment;
  }

  public async getComments(projectId: string, filePath?: string): Promise<Comment[]> {
    let filtered = this.comments.filter(c => c.projectId === projectId);
    
    if (filePath) {
      filtered = filtered.filter(c => c.filePath === filePath);
    }
    
    return filtered.sort((a, b) => a.timestamp - b.timestamp);
  }

  public async updateComment(
    commentId: string, 
    updates: Partial<Comment>
  ): Promise<Comment> {
    const index = this.comments.findIndex(c => c.id === commentId);
    if (index === -1) {
      throw new Error('Comment not found');
    }

    const updatedComment = {
      ...this.comments[index],
      ...updates
    };

    this.comments[index] = updatedComment;
    this.saveData();
    return updatedComment;
  }

  public async deleteComment(commentId: string): Promise<boolean> {
    const initialLength = this.comments.length;
    this.comments = this.comments.filter(c => c.id !== commentId);
    this.saveData();
    return this.comments.length < initialLength;
  }

  // Add reply to a comment
  public async addReply(
    parentCommentId: string,
    userId: string,
    userDisplayName: string,
    content: string,
    userAvatarUrl?: string
  ): Promise<Comment> {
    const parentIndex = this.comments.findIndex(c => c.id === parentCommentId);
    if (parentIndex === -1) {
      throw new Error('Parent comment not found');
    }

    const reply: Comment = {
      id: `reply_${Math.random().toString(36).substring(2, 11)}`,
      projectId: this.comments[parentIndex].projectId,
      userId,
      userDisplayName,
      userAvatarUrl,
      content,
      timestamp: Date.now(),
      resolved: false
    };

    if (!this.comments[parentIndex].replies) {
      this.comments[parentIndex].replies = [];
    }

    this.comments[parentIndex].replies!.push(reply);
    this.saveData();
    return reply;
  }
}

// React hook for using project service
import { useState, useEffect } from 'react';
import { useAuth } from './authService';

export const useProjects = () => {
  const projectService = ProjectService.getInstance();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      if (user) {
        setLoading(true);
        try {
          const userProjects = await projectService.getProjects(user.id);
          setProjects(userProjects);
        } catch (error) {
          console.error('Failed to load projects:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setProjects([]);
        setLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  return {
    projects,
    loading,
    createProject: projectService.createProject.bind(projectService),
    getProjectById: projectService.getProjectById.bind(projectService),
    updateProject: projectService.updateProject.bind(projectService),
    deleteProject: projectService.deleteProject.bind(projectService),
    addCollaborator: projectService.addCollaborator.bind(projectService),
    removeCollaborator: projectService.removeCollaborator.bind(projectService),
    addConversionHistory: projectService.addConversionHistory.bind(projectService),
    getProjectHistory: projectService.getProjectHistory.bind(projectService),
    addComment: projectService.addComment.bind(projectService),
    getComments: projectService.getComments.bind(projectService),
    updateComment: projectService.updateComment.bind(projectService),
    deleteComment: projectService.deleteComment.bind(projectService),
    addReply: projectService.addReply.bind(projectService)
  };
};
