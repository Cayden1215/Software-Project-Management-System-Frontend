import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { createAppRouter } from './routes';
import { ProjectService } from './apiService';
import type { ProjectDto, UserDto, Role } from './types';

// App-level types
export interface User {
  userID: number;
  name: string;
  email: string;
  role: Role | string;
}

export interface Project extends ProjectDto {
  // Extends ProjectDto with additional app-level properties
}

const initialProjects: Project[] = [];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all projects when user logs in
  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentUser) {
        setProjects([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const projectsData = await ProjectService.getAllProjects();
        setProjects(projectsData || []);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch projects';
        setError(errorMsg);
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleSignup = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProjects([]);
  };

  const handleCreateProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  const handleDeleteProject = (projectId: string) => {
    const numId = parseInt(projectId);
    setProjects(projects.filter(p => p.projectID !== numId));
  };

  const handleEnrollProject = (projectId: string) => {
    // Project enrollment is typically handled via API
    // This just updates the local state for UI feedback
    console.log('Enrolled in project:', projectId);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.projectID === updatedProject.projectID ? updatedProject : p));
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