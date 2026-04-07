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
    navigate(`/projects/${project.id}`);
  };

  return (
    <ProjectList
      projects={projects}
      currentUser={currentUser}
      onSelectProject={handleSelectProject}
      onEnrollProject={onEnrollProject}
      onCreateProject={onCreateProject}
      onDeleteProject={onDeleteProject}
      onLogout={onLogout}
    />
  );
}
