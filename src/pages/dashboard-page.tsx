import { User, Project } from '../App';
import { ProjectList } from '../components/project-list';
import { useNavigate } from 'react-router';

interface DashboardPageProps {
  currentUser: User;
  projects: Project[];
  onCreateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onEnrollProject: (projectId: string) => void;
  onLogout: () => void;
}

export default function DashboardPage({
  currentUser,
  projects,
  onCreateProject,
  onDeleteProject,
  onEnrollProject,
  onLogout,
}: DashboardPageProps) {
  const navigate = useNavigate();

  const handleSelectProject = (project: Project) => {
    navigate(`/projects/${project.projectID}`);
  };

  const handleEnrollProject = (projectId: number) => {
    onEnrollProject(projectId.toString());
  };

  const handleCreateProject = (project: Project) => {
    onCreateProject(project);
  };

  const handleDeleteProject = (projectId: number) => {
    onDeleteProject(projectId.toString());
  };

  return (
    <ProjectList
      currentUser={currentUser}
      projects={projects}
      onSelectProject={handleSelectProject}
      onEnrollProject={handleEnrollProject}
      onCreateProject={handleCreateProject}
      onDeleteProject={handleDeleteProject}
      onLogout={onLogout}
    />
  );
}
