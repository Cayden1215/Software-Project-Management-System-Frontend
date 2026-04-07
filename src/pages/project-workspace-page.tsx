import { User, Project } from '../App';
import { ProjectWorkspace } from '../components/project-workspace';
import { useParams, useNavigate, Navigate } from 'react-router';

interface ProjectWorkspacePageProps {
  currentUser: User;
  projects: Project[];
  onUpdateProject: (project: Project) => void;
}

export default function ProjectWorkspacePage({
  currentUser,
  projects,
  onUpdateProject,
}: ProjectWorkspacePageProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return <Navigate to="/dashboard" replace />;
  }

  const isProjectManager = project.manager === currentUser.email;

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <ProjectWorkspace
      project={project}
      currentUser={currentUser}
      isManager={isProjectManager}
      onUpdateProject={onUpdateProject}
      onBack={handleBack}
    />
  );
}
