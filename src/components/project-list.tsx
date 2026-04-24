import { useState } from 'react';
import { User, Project } from '../App';
import { Folder, Calendar, Plus, Trash2, LogOut, X, Settings, Info } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ProjectService } from '../apiService';

interface ProjectListProps {
  currentUser: User;
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onEnrollProject: (projectId: number) => void;
  onCreateProject: (project: Project) => void;
  onDeleteProject: (projectId: number) => void;
  onLogout: () => void;
}

export function ProjectList({ 
  currentUser, 
  projects,
  onSelectProject, 
  onEnrollProject,
  onCreateProject,
  onDeleteProject,
  onLogout 
}: ProjectListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  
  const isManager = currentUser.role === 'manager' || currentUser.role === 'PROJECT_MANAGER';
  
  // Filter projects based on user role
  const myProjects = projects.filter(p => {
    if (isManager) {
      return p.projectManagerID === currentUser.userID;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Project Management System</h1>
            <p className="text-gray-600">
              Welcome, {currentUser.name}
              <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                isManager ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {isManager ? 'Project Manager' : 'Team Member'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={() => navigate('/about')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              title="About"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* My Projects */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">
              {isManager ? 'My Projects' : 'Available Projects'}
            </h2>
            {isManager && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </button>
            )}
          </div>
          
          {myProjects.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <Folder className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">
                {isManager 
                  ? 'No projects created yet. Create one to get started!'
                  : 'No projects available to join yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map(project => (
                <ProjectCard
                  key={project.projectID}
                  project={project}
                  currentUser={currentUser}
                  isManager={isManager}
                  onSelect={onSelectProject}
                  onDelete={isManager ? onDeleteProject : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Project Modal */}
        {showCreateModal && (
          <CreateProjectModal
            currentUser={currentUser}
            onCreateProject={(newProject) => {
              onCreateProject(newProject);
              setShowCreateModal(false);
            }}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  currentUser: User;
  isManager: boolean;
  onSelect: (project: Project) => void;
  onDelete?: (projectId: number) => void;
}

function ProjectCard({ project, currentUser, isManager, onSelect, onDelete }: ProjectCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(project.projectID);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div 
      className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer relative"
      onClick={() => onSelect(project)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-gray-900 mb-2 font-semibold">{project.projectName}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(project.projectStatus)}`}>
              {project.projectStatus || 'Unknown'}
            </span>
            {isManager && project.projectManagerID === currentUser.userID && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                Manager
              </span>
            )}
          </div>
        </div>
        {isManager && onDelete && (
          <button
            onClick={handleDeleteClick}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete project"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.projectDescription}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>End: {new Date(project.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onSelect(project);
        }}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Open Project
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex flex-col items-center justify-center p-4 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="w-12 h-12 text-red-600 mb-3" />
          <p className="text-gray-900 mb-2 text-center font-semibold">Delete this project?</p>
          <p className="text-sm text-gray-600 mb-4 text-center">This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmDelete();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CreateProjectModalProps {
  currentUser: User;
  onCreateProject: (project: Project) => void;
  onClose: () => void;
}

function CreateProjectModal({ currentUser, onCreateProject, onClose }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    projectStatus: 'planning',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const newProjectData = {
        projectID: 0,
        projectName: formData.projectName,
        projectDescription: formData.projectDescription,
        projectManagerID: currentUser.userID,
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        projectStatus: formData.projectStatus,
      };

      // Call API to create project
      const createdProject = await ProjectService.createProject(newProjectData);
      
      if (createdProject) {
        onCreateProject(createdProject as Project);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMsg);
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-gray-900 font-semibold">Create New Project</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Project Name */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Project Name *</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="Enter project name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Description</label>
              <textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                placeholder="Enter project description"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Initial Status</label>
              <select
                value={formData.projectStatus}
                onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
