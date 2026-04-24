import { useState, useEffect } from 'react';
import { User, Project, Task, Sprint, TeamMember } from '../App';
import { ArrowLeft, LayoutGrid, Calendar, Users, ClipboardList, User as UserIcon, Edit2 } from 'lucide-react';
import { useParams } from 'react-router';
import useApi from '../hooks/useApi';
import { ProjectService } from '../apiService';
import type { ProjectDto } from '../types';
import { ScrumKanbanBoard } from './scrum-kanban-board';
import { TimelineView } from './timeline-view';
import { ResourceManagement } from './resource-management';
import { TaskManagement } from './task-management';
import { TeamMemberProfile } from './team-member-profile';

interface ProjectWorkspaceProps {
  currentUser: User;
  isManager: boolean;
  onBack: () => void;
}

type ViewType = 'tasks' | 'kanban' | 'timeline' | 'resources' | 'profile';

// Helper function to convert ProjectDto to Project
function transformProjectDtoToProject(dto: ProjectDto): Project {
  return {
    id: String(dto.projectID),
    projectName: dto.projectName,
    projectDescription: dto.projectDescription,
    //projectManagerID: String(dto.projectManagerID),
    members: [],
    teamMembers: [],
    registeredSkills: [],
    tasks: [],
    sprints: [],
    createdAt: dto.startDate,
    projectStatus: (dto.projectStatus as 'planning' | 'active' | 'on-hold' | 'completed') || 'planning',
  };
}

export function ProjectWorkspace({ currentUser, isManager, onBack }: ProjectWorkspaceProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeView, setActiveView] = useState<ViewType>(isManager ? 'tasks' : 'kanban');
  const [showStatusEdit, setShowStatusEdit] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  
  const { data: projectDto, loading, error, execute: fetchProject } = useApi(ProjectService.getProjectById);
  
  // Fetch project on mount and transform DTO to Project
  useEffect(() => {
    if (projectId) {
      fetchProject(Number(projectId));
    }
  }, [projectId, fetchProject]);

  // Transform ProjectDto to Project when data arrives
  useEffect(() => {
    if (projectDto) {
      setProject(transformProjectDtoToProject(projectDto));
    }
  }, [projectDto]);

  const handleStatusChange = (status: Project['projectStatus']) => {
    if (project) {
      // Update project status via API
      const updatedProject = { ...project, status };
      setProject(updatedProject);
      console.log('Updating project status:', status);
    }
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProject(updatedProject);
    // Here you would typically call an API to persist the changes
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'planning':
        return 'bg-blue-100 text-blue-700';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'planning':
        return 'Planning';
      case 'on-hold':
        return 'On Hold';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 border border-red-200 max-w-md">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error loading project</p>
            <p className="text-sm mt-2">{error?.message || 'Project not found'}</p>
          </div>
          <button
            onClick={onBack}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-gray-900">{project.projectName}</h1>
              <p className="text-gray-600 text-sm">{project.projectDescription}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => isManager && setShowStatusEdit(!showStatusEdit)}
                  className={`px-3 py-1 rounded-lg flex items-center gap-2 ${getStatusColor(project.projectStatus)} ${
                    isManager ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                  }`}
                  disabled={!isManager}
                >
                  {getStatusLabel(project.projectStatus)}
                  {isManager && <Edit2 className="w-3 h-3" />}
                </button>
                
                {/* Status Edit Dropdown */}
                {showStatusEdit && isManager && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="p-2">
                      {(['planning', 'active', 'on-hold', 'completed'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className={`w-full px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors ${getStatusColor(status)}`}
                        >
                          {getStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {isManager && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">
                  Project Manager
                </span>
              )}
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('tasks')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeView === 'tasks'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Task Management
            </button>
            <button
              onClick={() => setActiveView('kanban')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeView === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban Board
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeView === 'timeline'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Timeline
            </button>
            {isManager && (
              <button
                onClick={() => setActiveView('resources')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeView === 'resources'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Resource Management
              </button>
            )}
            {!isManager && (
              <button
                onClick={() => setActiveView('profile')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeView === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                My Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeView === 'tasks' && project && (
          <TaskManagement
            project={project}
            isManager={isManager}
            onUpdateProject={handleUpdateProject}
          />
        )}
        {activeView === 'kanban' && project && (
          <ScrumKanbanBoard
            project={project}
            currentUser={currentUser}
            isManager={isManager}
            onUpdateProject={handleUpdateProject}
          />
        )}
        {activeView === 'timeline' && project && (
          <TimelineView
            project={project}
            isManager={isManager}
            onUpdateProject={handleUpdateProject}
          />
        )}
        {activeView === 'resources' && isManager && project && (
          <ResourceManagement
            project={project}
            isManager={isManager}
            onUpdateProject={handleUpdateProject}
          />
        )}
        {activeView === 'profile' && !isManager && project && (
          <TeamMemberProfile
            currentUser={currentUser}
            project={project}
            onUpdateProject={handleUpdateProject}
          />
        )}
      </div>
    </div>
  );
}