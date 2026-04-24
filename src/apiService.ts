import apiClient from './apiClient';
import {
  AuthenticationRequest,
  AuthenticationResponse,
  UserDto,
  User,
  ProjectDto,
  Project,
  ProjectMemberDto,
  SprintDto,
  TaskAssignmentDto,
  SkillDto,
  ProjectMemberSkillDto,
  Role,
} from './types';

// ==========================================
// AUTHENTICATION SERVICE
// ==========================================
export const AuthService = {
  register: async (data: UserDto): Promise<User | null> => {
    try {
      const response = await apiClient.post<User>('/api/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  authenticate: async (data: AuthenticationRequest): Promise<AuthenticationResponse | null> => {
    try {
      const response = await apiClient.post<AuthenticationResponse>('/api/auth/login', data);
      localStorage.setItem('authToken', response.data.token); // Store token for future requests
      return response.data;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  },
};

// ==========================================
// PROJECT SERVICE
// ==========================================
export const ProjectService = {
  getAllProjects: async (): Promise<ProjectDto[]> => {
    try {
      const response = await apiClient.get<ProjectDto[]>('/api/v1/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching all projects:', error);
      throw error;
    }
  },

  getProjectById: async (id: number): Promise<ProjectDto | null> => {
    try {
      const response = await apiClient.get<ProjectDto>(`/api/v1/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },

  createProject: async (data: ProjectDto): Promise<ProjectDto | null> => {
    try {
      const response = await apiClient.post<ProjectDto>('/api/v1/projects', data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  updateProject: async (id: number, data: ProjectDto): Promise<ProjectDto | null> => {
    try {
      const response = await apiClient.put<ProjectDto>(`/api/v1/projects/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },

  deleteProject: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/projects/${id}`);
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  },

  enrollTeamMember: async (projectId: number, data: ProjectMemberDto): Promise<void> => {
    try {
      await apiClient.post(`/api/v1/projects/${projectId}/enroll`, data);
    } catch (error) {
      console.error(`Error enrolling member to project ${projectId}:`, error);
      throw error;
    }
  },

  getEnrolledMembers: async (projectId: number): Promise<ProjectMemberDto[]> => {
    try {
      const response = await apiClient.get<ProjectMemberDto[]>(`/api/v1/projects/${projectId}/enrolled`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching members for project ${projectId}:`, error);
      throw error;
    }
  },
};

// ==========================================
// CONVERSION UTILITIES
// ==========================================
export const convertProjectDtoToProject = (dto: ProjectDto): Project => {
  return {
    projectID: dto.projectID,
    projectName: dto.projectName,
    projectDescription: dto.projectDescription,
    startDate: dto.startDate,
    deadline: dto.deadline,
    projectStatus: dto.projectStatus,
    projectManager: {
      userID: dto.projectManagerID,
      name: '',
      email: '',
      role: Role.PROJECT_MANAGER,
    },
  };
};

// ==========================================
// SPRINT SERVICE
// ==========================================
export const SprintService = {
  getSprintById: async (id: number): Promise<SprintDto | null> => {
    try {
      const response = await apiClient.get<SprintDto>(`/api/v1/sprints/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sprint ${id}:`, error);
      throw error;
    }
  },

  updateSprint: async (id: number, data: SprintDto): Promise<SprintDto | null> => {
    try {
      const response = await apiClient.put<SprintDto>(`/api/v1/sprints/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating sprint ${id}:`, error);
      throw error;
    }
  },

  deleteSprint: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/sprints/${id}`);
    } catch (error) {
      console.error(`Error deleting sprint ${id}:`, error);
      throw error;
    }
  },

  createSprint: async (projectId: number, data: SprintDto): Promise<SprintDto | null> => {
    try {
      const response = await apiClient.post<SprintDto>(`/api/v1/sprints/${projectId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating sprint for project ${projectId}:`, error);
      throw error;
    }
  },

  getSprintsByProjectId: async (projectId: number): Promise<SprintDto[]> => {
    try {
      const response = await apiClient.get<SprintDto[]>(`/api/v1/sprints/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sprints for project ${projectId}:`, error);
      throw error;
    }
  },
};

// ==========================================
// TASK ASSIGNMENT SERVICE
// ==========================================
export const TaskAssignmentService = {
  getTaskAssignmentsByProject: async (projectId: number): Promise<TaskAssignmentDto[]> => {
    try {
      const response = await apiClient.get<TaskAssignmentDto[]>(`/api/v1/project/${projectId}/tasks/assignments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task assignments for project ${projectId}:`, error);
      throw error;
    }
  },

  getTaskAssignment: async (projectId: number, taskId: number): Promise<TaskAssignmentDto | null> => {
    try {
      const response = await apiClient.get<TaskAssignmentDto>(`/api/v1/project/${projectId}/tasks/assignments/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task assignment ${taskId} in project ${projectId}:`, error);
      throw error;
    }
  },

  createTaskAssignment: async (projectId: number, taskId: number, data: TaskAssignmentDto): Promise<TaskAssignmentDto | null> => {
    try {
      const response = await apiClient.post<TaskAssignmentDto>(`/api/v1/project/${projectId}/tasks/assignments/${taskId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating task assignment for task ${taskId}:`, error);
      throw error;
    }
  },

  updateTaskAssignment: async (projectId: number, taskId: number, data: TaskAssignmentDto): Promise<TaskAssignmentDto | null> => {
    try {
      const response = await apiClient.put<TaskAssignmentDto>(`/api/v1/project/${projectId}/tasks/assignments/${taskId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating task assignment for task ${taskId}:`, error);
      throw error;
    }
  },

  scheduleTaskAssignment: async (projectId: number, data: TaskAssignmentDto): Promise<TaskAssignmentDto | null> => {
    try {
      const response = await apiClient.post<TaskAssignmentDto>(`/api/v1/project/${projectId}/tasks/assignments/schedule`, data);
      return response.data;
    } catch (error) {
      console.error(`Error scheduling task assignment for project ${projectId}:`, error);
      throw error;
    }
  },
};

// ==========================================
// SKILL SERVICE
// ==========================================
export const SkillService = {
  getProjectSkills: async (projectId: number): Promise<SkillDto[]> => {
    try {
      const response = await apiClient.get<SkillDto[]>(`/api/v1/project/${projectId}/skills`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching skills for project ${projectId}:`, error);
      throw error;
    }
  },

  getSkillById: async (projectId: number, id: number): Promise<SkillDto | null> => {
    try {
      const response = await apiClient.get<SkillDto>(`/api/v1/project/${projectId}/skills/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching skill ${id} in project ${projectId}:`, error);
      throw error;
    }
  },

  createSkill: async (projectId: number, data: SkillDto): Promise<SkillDto | null> => {
    try {
      const response = await apiClient.post<SkillDto>(`/api/v1/project/${projectId}/skills`, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating skill for project ${projectId}:`, error);
      throw error;
    }
  },

  deleteSkill: async (projectId: number, id: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/project/${projectId}/skills/${id}`);
    } catch (error) {
      console.error(`Error deleting skill ${id} in project ${projectId}:`, error);
      throw error;
    }
  },
};

// ==========================================
// PROJECT MEMBER SKILL SERVICE
// ==========================================
export const ProjectMemberSkillService = {
  getProjectMemberSkills: async (projectId: number, projectMemberId: number): Promise<ProjectMemberSkillDto | null> => {
    try {
      // NOTE: The backend documentation specifies this route doesn't structurally need 'projectId' for the fetch, but paths indicate its parent context
      const response = await apiClient.get<ProjectMemberSkillDto>(`/api/v1/project/${projectId}/project-member-skills/${projectMemberId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching skills for member ${projectMemberId}:`, error);
      throw error;
    }
  },

  addSkillsToProjectMember: async (projectId: number, data: ProjectMemberSkillDto): Promise<ProjectMemberSkillDto | null> => {
    try {
      const response = await apiClient.post<ProjectMemberSkillDto>(`/api/v1/project/${projectId}/project-member-skills`, data);
      return response.data;
    } catch (error) {
      console.error(`Error adding skills to member in project ${projectId}:`, error);
      throw error;
    }
  },

  updateProjectMemberSkills: async (projectId: number, projectMemberId: number, data: ProjectMemberSkillDto): Promise<ProjectMemberSkillDto | null> => {
    try {
      const response = await apiClient.put<ProjectMemberSkillDto>(`/api/v1/project/${projectId}/project-member-skills/${projectMemberId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating skills for member ${projectMemberId}:`, error);
      throw error;
    }
  },

  removeSkillFromProjectMember: async (projectId: number, projectMemberId: number, skillId: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/project/${projectId}/project-member-skills/${projectMemberId}/skill/${skillId}`);
    } catch (error) {
      console.error(`Error removing skill ${skillId} from member ${projectMemberId}:`, error);
      throw error;
    }
  },

  removeAllSkillsFromProjectMember: async (projectId: number, projectMemberId: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/project/${projectId}/project-member-skills/${projectMemberId}/all-skills`);
    } catch (error) {
      console.error(`Error removing all skills from member ${projectMemberId}:`, error);
      throw error;
    }
  },
};

// ==========================================
// SCHEDULING SERVICE
// ==========================================
export const SchedulingService = {
  activateScheduler: async (projectId: number): Promise<string | null> => {
    try {
      const response = await apiClient.post<string>(`/api/v1/scheduling/project/${projectId}/run`);
      return response.data;
    } catch (error) {
      console.error(`Error running scheduler for project ${projectId}:`, error);
      throw error;
    }
  },

  getProjectAssignments: async (projectId: number): Promise<TaskAssignmentDto[]> => {
    try {
      const response = await apiClient.get<TaskAssignmentDto[]>(`/api/v1/scheduling/project/${projectId}/assignments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching scheduled assignments for project ${projectId}:`, error);
      throw error;
    }
  },
};