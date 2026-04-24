# API Data Fetching Implementation Guide

## Overview

This guide shows how to fetch data from the backend API and display it in your React components using the established patterns in this project.

## Architecture Flow

```
React Component
       ↓
   useApi Hook (custom hook for state management)
       ↓
   apiService (service methods for endpoints)
       ↓
   apiClient (axios instance with interceptors)
       ↓
   Backend API (Spring Boot)
```

## File Locations & Responsibilities

| File | Purpose |
|------|---------|
| `src/apiClient.ts` | Axios instance setup with auth interceptors |
| `src/apiService.ts` | All API endpoint methods (CRUD operations) |
| `src/hooks/useApi.ts` | Custom React hook for async state management |
| `src/types.ts` | TypeScript interfaces for all data models |

## Step-by-Step Implementation

### Step 1: Identify the API Service Method

First, check `src/apiService.ts` to find the right method. Example methods:

```typescript
// List all projects
ProjectService.getAllProjects()

// Get single project by ID
ProjectService.getProjectById(id: number)

// Create new project
ProjectService.createProject(data: ProjectDto)

// Update project
ProjectService.updateProject(id: number, data: ProjectDto)

// Delete project
ProjectService.deleteProject(id: number)
```

### Step 2: Import Required Items

```typescript
import { useEffect } from 'react';
import useApi from '../hooks/useApi';
import { ProjectService } from '../apiService';
import { ProjectDto } from '../types';
```

### Step 3: Initialize useApi Hook

```typescript
export function MyComponent() {
  // This hook manages: data, loading, error, and execute function
  const { data, loading, error, execute } = useApi(ProjectService.getAllProjects);
  
  // ...rest of component
}
```

### Step 4: Trigger API Call on Mount

```typescript
useEffect(() => {
  execute(); // Call with no parameters for list endpoints
  // Or with parameters for specific queries:
  // execute(projectId); // for getProjectById
}, [execute]);
```

### Step 5: Handle All UI States

```typescript
return (
  <div>
    {/* Loading State */}
    {loading && <div className="text-center">Loading...</div>}
    
    {/* Error State */}
    {error && (
      <div className="bg-red-50 p-4 rounded border border-red-200">
        <p className="text-red-700">Error: {error.message}</p>
      </div>
    )}
    
    {/* Empty State */}
    {!loading && data && data.length === 0 && (
      <div className="text-center text-gray-500">No items found</div>
    )}
    
    {/* Success State - Display Data */}
    {data && data.length > 0 && (
      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.projectID} className="p-4 border rounded">
            {item.projectName}
          </li>
        ))}
      </ul>
    )}
  </div>
);
```

---

## Common Patterns with Examples

### Pattern 1: Display a List

**Scenario:** Show all projects when component loads

```typescript
import { useEffect } from 'react';
import useApi from '../hooks/useApi';
import { ProjectService } from '../apiService';

export function ProjectsList() {
  const { data: projects, loading, error, execute } = useApi(
    ProjectService.getAllProjects
  );

  useEffect(() => {
    execute(); // No parameters needed
  }, [execute]);

  return (
    <div className="space-y-4">
      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      {projects && (
        <ul>
          {projects.map((project) => (
            <li key={project.projectID} className="p-4 border rounded">
              <h3 className="font-bold">{project.projectName}</h3>
              <p className="text-gray-600">{project.projectDescription}</p>
              <p className="text-sm text-gray-500">
                Status: {project.projectStatus}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Pattern 2: Fetch by ID from URL

**Scenario:** Show project details based on URL parameter

```typescript
import { useEffect } from 'react';
import { useParams } from 'react-router';
import useApi from '../hooks/useApi';
import { ProjectService } from '../apiService';

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, loading, error, execute } = useApi(
    ProjectService.getProjectById
  );

  useEffect(() => {
    if (projectId) {
      execute(Number(projectId)); // Pass ID as parameter
    }
  }, [projectId, execute]);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      {project && (
        <div className="p-6 border rounded">
          <h1 className="text-2xl font-bold">{project.projectName}</h1>
          <p className="text-gray-600 my-4">{project.projectDescription}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p>{project.startDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deadline</p>
              <p>{project.deadline}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Pattern 3: Form Submission (Create/Update)

**Scenario:** Submit form to create a new project

```typescript
import { useState } from 'react';
import useApi from '../hooks/useApi';
import { ProjectService } from '../apiService';
import { ProjectDto } from '../types';

export function CreateProjectForm() {
  const [formData, setFormData] = useState<Partial<ProjectDto>>({
    projectName: '',
    projectDescription: '',
    startDate: '',
    deadline: '',
    projectStatus: 'ACTIVE',
  });

  const { loading: isSubmitting, error, execute: createProject } = useApi(
    ProjectService.createProject
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(formData as ProjectDto);
      alert('Project created successfully!');
      setFormData({
        projectName: '',
        projectDescription: '',
        startDate: '',
        deadline: '',
        projectStatus: 'ACTIVE',
      });
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Project Name</label>
        <input
          type="text"
          value={formData.projectName || ''}
          onChange={(e) =>
            setFormData({ ...formData, projectName: e.target.value })
          }
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.projectDescription || ''}
          onChange={(e) =>
            setFormData({ ...formData, projectDescription: e.target.value })
          }
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Start Date</label>
        <input
          type="date"
          value={formData.startDate || ''}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Deadline</label>
        <input
          type="date"
          value={formData.deadline || ''}
          onChange={(e) =>
            setFormData({ ...formData, deadline: e.target.value })
          }
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Project'}
      </button>

      {error && (
        <p className="text-red-600 text-sm">{error.message}</p>
      )}
    </form>
  );
}
```

### Pattern 4: Delete with Confirmation

**Scenario:** Delete a project after user confirms

```typescript
import { useState } from 'react';
import useApi from '../hooks/useApi';
import { ProjectService } from '../apiService';

export function ProjectActions({ projectId }: { projectId: number }) {
  const { loading, error, execute: deleteProject } = useApi(
    ProjectService.deleteProject
  );
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await deleteProject(projectId);
      alert('Project deleted successfully');
      // Navigate away or refresh list
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsConfirming(true)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Delete Project
      </button>

      {isConfirming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded">
            <p className="mb-4">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
            </div>
            {error && <p className="text-red-600 mt-2">{error.message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Pattern 5: Cascading Data Fetch

**Scenario:** Fetch project first, then fetch its sprints

```typescript
import { useEffect } from 'react';
import { useParams } from 'react-router';
import useApi from '../hooks/useApi';
import { ProjectService } from '../apiService';
import { SprintService } from '../apiService';

export function ProjectWithSprints() {
  const { projectId } = useParams<{ projectId: string }>();

  // First fetch: Get the project
  const { data: project, execute: fetchProject } = useApi(
    ProjectService.getProjectById
  );

  // Second fetch: Get sprints for this project
  const { data: sprints, execute: fetchSprints } = useApi(
    SprintService.getSprintsByProject
  );

  // Fetch project on mount
  useEffect(() => {
    if (projectId) {
      fetchProject(Number(projectId));
    }
  }, [projectId, fetchProject]);

  // Fetch sprints when project is loaded
  useEffect(() => {
    if (project?.projectID) {
      fetchSprints(project.projectID);
    }
  }, [project?.projectID, fetchSprints]);

  return (
    <div>
      <h1>{project?.projectName}</h1>
      <div>
        <h2>Sprints</h2>
        {sprints && sprints.map((sprint) => (
          <div key={sprint.sprintID} className="p-4 border rounded">
            <h3>{sprint.sprintName}</h3>
            <p>{sprint.sprintGoal}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Pattern 6: Search with Debounce

**Scenario:** Search projects as user types

```typescript
import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';
import { ProjectService } from '../apiService';

export function ProjectSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: projects, execute: search } = useApi(
    ProjectService.searchProjects // Assuming this exists
  );

  useEffect(() => {
    // Debounce the search
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        search(searchTerm);
      }
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm, search]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
      <div className="mt-4">
        {projects && (
          <ul>
            {projects.map((project) => (
              <li key={project.projectID} className="p-2 border-b">
                {project.projectName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

---

## State Management Summary

The `useApi` hook provides you with:

```typescript
const { 
  data,      // The fetched data (null while loading)
  loading,   // Boolean: true while API call is in progress
  error,     // Error object if API call failed
  execute    // Function to trigger the API call (pass parameters if needed)
} = useApi(apiServiceMethod);
```

---

## Key Points to Remember

✅ **Do's:**
- Always handle loading, error, and empty states
- Use `useEffect` to trigger API calls on mount or when dependencies change
- Debounce search/filter API calls to reduce requests
- Show user-friendly error messages
- Clear sensitive data from state after logout

❌ **Don'ts:**
- Don't call `execute()` directly in render (use `useEffect`)
- Don't forget to include `execute` in `useEffect` dependencies
- Don't make multiple API calls in loops
- Don't expose raw error objects to users (provide friendly messages)

---

## Debugging Tips

1. **Check Network Tab:** Open DevTools → Network tab to see API requests
2. **Check Console:** Look for error logs from `apiClient.ts` interceptors
3. **Check useApi State:** Log `{ data, loading, error }` to console
4. **Check URL:** Verify the API endpoint is correct in `apiService.ts`
5. **Check Auth Token:** Ensure token is stored in `localStorage` under `authToken` key

---

## Quick Reference: useApi Hook

The `useApi` hook is already set up in `src/hooks/useApi.ts`:

```typescript
function useApi<T>(apiFunction: ApiServiceFunction<T>): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, loading, error, execute };
}
```

No need to modify this - it's ready to use!
