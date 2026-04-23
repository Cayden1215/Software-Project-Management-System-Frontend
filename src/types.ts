// ==========================================
// ENUMS
// ==========================================

export enum Role {
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  TEAM_MEMBER = 'TEAM_MEMBER'
}

// ==========================================
// DATA TRANSFER OBJECTS (DTOs)
// ==========================================

export interface AuthenticationRequest {
  email?: string;
  password?: string;
}

export interface AuthenticationResponse {
  token: string;
}

export interface ErrorResponse {
  message: string;
  status: number;
  timestamp: string;
  path?: string;
}

export interface ProjectDto {
  projectID: number;
  projectName: string;
  projectDescription: string;
  startDate: string;      // ISO Date string (YYYY-MM-DD)
  deadline: string;       // ISO Date string (YYYY-MM-DD)
  projectStatus: string;
  projectManagerID: number;
}

export interface ProjectManagerDto {
  userID: number;
  name?: string;
  password?: string;
  email?: string;
}

export interface ProjectMemberDto {
  projectMemberID: number;
  projectID: number;
  teamMemberID: number;
  teamMemberUsername: string;
  teamMemberEmail: string;
  enrollmentDate: string; // ISO Date string (YYYY-MM-DD)
  projectRole: string;
  skills: Skill[];
}

export interface ProjectMemberSkillDto {
  projectMemberID: number;
  skillIDs: number[];
  skills: SkillDto[];
}

export interface SkillDto {
  skillID: number;
  skillName: string;
  projectID: number;
}

export interface SprintDto {
  sprintID: number;
  sprintName: string;
  startDate: string;      // ISO Date string (YYYY-MM-DD)
  endDate: string;        // ISO Date string (YYYY-MM-DD)
  sprintGoal: string;
  sprintStatus: string;
  project?: Project;
}

export interface TaskAssignmentDto {
  assignmentID: number;
  taskID: number;
  taskName: string;
  requiredMemberNum: number;
  assignedMemberIds: number[];
  assignedMemberNames: string[];
  scheduledStartDate: string; // ISO Date string (YYYY-MM-DD)
  scheduledEndDate: string;   // ISO Date string (YYYY-MM-DD)
  projectID: number;
}

export interface TaskDto {
  taskID: number;
  taskName: string;
  estimatedDuration: number;
  description: string;
  taskStatus: string;
  requiredMemberNum: number;
  storyPoint: number;
  projectID: number;
  sprintID?: number;
  skillIDs: number[];
  dependencyIds: number[];
}

export interface TeamMemberDto {
  userID: number;
  username: string;
  email: string;
  availability: boolean;
  role: string;
}

export interface TeamMemberSkillDto {
  tmsID: number;
  skillID: number;
  userID: number;
}

export interface UserDto {
  userID: number;
  name: string;
  password?: string;
  email: string;
  role: string;
}

// ==========================================
// ENTITIES
// ==========================================

export interface User {
  userID: number;
  name: string;
  email: string;
  role: Role | string;
}

export interface ProjectManager extends User {
  projects?: Project[];
}

export interface TeamMember extends User {
  availability: boolean;
  projectMemberships?: ProjectMember[];
}

export interface Project {
  projectID: number;
  projectName: string;
  projectDescription: string;
  startDate: string;
  deadline: string;
  projectStatus: string;
  projectManager: ProjectManager;
  tasks?: Task[];
  projectMembers?: ProjectMember[];
  sprints?: Sprint[];
  skills?: Skill[];
  taskAssignments?: TaskAssignment[];
}

export interface Skill {
  skillID: number;
  skillName: string;
  // NOTE: 'project' is omitted here because it has @JsonIgnore in your Java entity
}

export interface ProjectMember {
  ID: number;
  project?: Project;
  teamMember?: TeamMember;
  enrollmentDate: string;
  projectRole: string;
  skills?: Skill[];
}

export interface Sprint {
  sprintID: number;
  sprintName: string;
  startDate: string;
  endDate: string;
  sprintGoal: string;
  sprintStatus: string;
  project?: Project;
  tasks?: Task[];
}

export interface Task {
  taskID: number;
  taskName: string;
  estimatedDuration: number;
  description: string;
  taskStatus: string;
  requiredMemberNum: number;
  storyPoint: number;
  project?: Project;
  sprint?: Sprint;
  taskAssignment?: TaskAssignment;
  skills?: Skill[];
  dependencies?: Task[];
  dependentTasks?: Task[];
}

export interface TaskAssignment {
  assignmentID: number;
  scheduledStartDate: string;
  scheduledEndDate: string;
  task?: Task;
  assignedMembers?: ProjectMember[];
  project?: Project;
}

// ==========================================
// API WRAPPERS
// ==========================================

/**
 * Note: Looking at your Spring Boot controllers (e.g. ResponseEntity.ok(createdUser)), 
 * your endpoints directly return the object payload rather than a custom wrapper object. 
 * However, if you are using Axios, the Axios response resolves similarly to this.
 * * If you ever standardize a unified { data: T, status: number, message: string } response 
 * from the backend, use this structure:
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}