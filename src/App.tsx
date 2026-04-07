import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { createAppRouter } from './routes';
import { ProjectList } from './components/project-list';
import { ProjectWorkspace } from './components/project-workspace';
import { LoginForm } from './components/login-form';
import { SignupForm } from './components/signup-form';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  status: 'planned' | 'active' | 'completed';
  taskIds: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignee?: string;
  requiredSkills: string[];
  startDate?: string;
  endDate?: string;
  duration: number; // in days
  dependencies: string[]; // task IDs
  priority: 'low' | 'medium' | 'high';
  sprintId?: string; // Sprint assignment
  storyPoints?: number; // For scrum estimation
}

export interface Project {
  id: string;
  name: string;
  description: string;
  manager: string;
  members: string[];
  teamMembers: TeamMember[];
  registeredSkills: string[]; // Skills registered by project manager
  tasks: Task[];
  sprints: Sprint[];
  createdAt: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
}

const mockUser: User = {
  id: 'user-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  role: 'manager',
};

const initialProjects: Project[] = [];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleSignup = (user: User) => {
    // In a real app, this would register the user in a database
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedProject(null);
  };

  const handleCreateProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  const handleEnrollProject = (projectId: string) => {
    if (!currentUser) return;
    
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        // Check if user is invited
        const invitedMember = project.teamMembers.find(tm => tm.email === currentUser.email);
        
        if (invitedMember && !project.members.includes(currentUser.email)) {
          // Update the team member with user info and add to project members
          const updatedTeamMembers = project.teamMembers.map(tm =>
            tm.email === currentUser.email
              ? { ...tm, name: currentUser.name }
              : tm
          );
          
          return {
            ...project,
            members: [...project.members, currentUser.email],
            teamMembers: updatedTeamMembers,
          };
        } else if (!project.members.includes(currentUser.email)) {
          // Regular enrollment (not invited)
          return { ...project, members: [...project.members, currentUser.email] };
        }
      }
      return project;
    }));
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  };

  // Create router with context
  const router = createAppRouter({
    currentUser,
    projects,
    setCurrentUser,
    setProjects,
    handleLogin,
    handleSignup,
    handleLogout,
    handleCreateProject,
    handleDeleteProject,
    handleEnrollProject,
    handleUpdateProject,
  });

  return <RouterProvider router={router} />;
}