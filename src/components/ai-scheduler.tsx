import { useState } from 'react';
import { Project, Task, TeamMember } from '../App';
import { Sparkles, Calendar, TrendingUp, AlertCircle, CheckCircle2, Zap, Users, X } from 'lucide-react';

interface AISchedulerProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onClose: () => void;
}

interface ScheduleResult {
  tasks: Task[];
  totalDuration: number;
  criticalPath: string[];
  warnings: string[];
  optimizations: string[];
  resourceAllocations: Map<string, string>; // taskId -> memberId
}

export function AIScheduler({ project, onUpdateProject, onClose }: AISchedulerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Topological sort to handle dependencies
  const topologicalSort = (tasks: Task[]): Task[] => {
    const sorted: Task[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      if (visiting.has(taskId)) {
        // Circular dependency detected
        return;
      }

      visiting.add(taskId);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.dependencies.forEach(depId => visit(depId));
        visiting.delete(taskId);
        visited.add(taskId);
        sorted.push(task);
      }
    };

    tasks.forEach(task => visit(task.id));
    return sorted;
  };

  const generateSchedule = () => {
    setIsGenerating(true);

    // Simulate AI processing
    setTimeout(() => {
      const sortedTasks = topologicalSort([...project.tasks]);
      const taskCompletionDates = new Map<string, Date>();
      const warnings: string[] = [];
      const optimizations: string[] = [];
      const criticalPath: string[] = [];

      let projectStart = new Date(startDate);
      let maxEndDate = new Date(projectStart);

      // Resource-aware scheduling
      const memberWorkload = new Map<string, { endDate: Date; totalDays: number }>();
      project.teamMembers.forEach(member => {
        memberWorkload.set(member.id, { 
          endDate: new Date(projectStart), 
          totalDays: 0
        });
      });

      // Helper function to find best team member for a task
      const findBestMember = (task: Task, earliestStart: Date): { member: TeamMember | null; actualStart: Date } => {
        if (project.teamMembers.length === 0) {
          return { member: null, actualStart: earliestStart };
        }

        // Find members with required skills
        let eligibleMembers = project.teamMembers;
        if (task.requiredSkills.length > 0) {
          eligibleMembers = project.teamMembers.filter(member =>
            task.requiredSkills.some(skill => member.skills.includes(skill))
          );

          if (eligibleMembers.length === 0) {
            warnings.push(`Task "${task.title}" requires skills [${task.requiredSkills.join(', ')}] but no team member has them`);
            eligibleMembers = project.teamMembers; // Fall back to all members
          }
        }

        // Sort by availability and current workload
        const sortedMembers = [...eligibleMembers].sort((a, b) => {
          const aWorkload = memberWorkload.get(a.id)!;
          const bWorkload = memberWorkload.get(b.id)!;
          
          // Prioritize by earliest availability, then by utilization
          const aEnd = aWorkload.endDate.getTime();
          const bEnd = bWorkload.endDate.getTime();
          if (aEnd !== bEnd) return aEnd - bEnd;
          
          return aWorkload.totalDays - bWorkload.totalDays;
        });

        const bestMember = sortedMembers[0];
        const memberAvailability = memberWorkload.get(bestMember.id)!;
        
        // Task can't start until both dependencies are done AND member is available
        const actualStart = new Date(Math.max(earliestStart.getTime(), memberAvailability.endDate.getTime()));
        
        return { member: bestMember, actualStart };
      };

      // Calculate start and end dates for each task
      const scheduledTasks = sortedTasks.map(task => {
        let taskStart = new Date(projectStart);

        // Check dependencies
        if (task.dependencies.length > 0) {
          const dependencyEndDates = task.dependencies
            .map(depId => taskCompletionDates.get(depId))
            .filter((date): date is Date => date !== undefined);

          if (dependencyEndDates.length > 0) {
            const latestDependencyEnd = new Date(Math.max(...dependencyEndDates.map(d => d.getTime())));
            taskStart = new Date(latestDependencyEnd);
            taskStart.setDate(taskStart.getDate() + 1); // Start next day after dependency
          }

          // Check for blocking dependencies
          const incompleteDeps = task.dependencies.filter(depId => {
            const depTask = project.tasks.find(t => t.id === depId);
            return depTask && depTask.status !== 'done';
          });

          if (incompleteDeps.length > 0) {
            warnings.push(`Task "${task.title}" is blocked by ${incompleteDeps.length} incomplete dependencies`);
          }
        }

        // Skip weekends (simple optimization)
        while (taskStart.getDay() === 0 || taskStart.getDay() === 6) {
          taskStart.setDate(taskStart.getDate() + 1);
        }

        const bestMemberInfo = findBestMember(task, taskStart);
        const actualStart = bestMemberInfo.actualStart;
        const member = bestMemberInfo.member;

        // Update member workload
        if (member) {
          const memberData = memberWorkload.get(member.id)!;
          memberData.endDate = new Date(actualStart);
          memberData.endDate.setDate(memberData.endDate.getDate() + task.duration);
          memberData.totalDays += task.duration;
          memberWorkload.set(member.id, memberData);
        }

        const taskEnd = new Date(actualStart);
        taskEnd.setDate(taskEnd.getDate() + task.duration);

        taskCompletionDates.set(task.id, taskEnd);

        if (taskEnd > maxEndDate) {
          maxEndDate = taskEnd;
        }

        return {
          ...task,
          startDate: actualStart.toISOString().split('T')[0],
          endDate: taskEnd.toISOString().split('T')[0],
        };
      });

      // Calculate critical path (longest path through dependencies)
      const calculatePathLength = (taskId: string, memo = new Map<string, number>()): number => {
        if (memo.has(taskId)) return memo.get(taskId)!;
        
        const task = scheduledTasks.find(t => t.id === taskId);
        if (!task) return 0;

        let maxDepLength = 0;
        task.dependencies.forEach(depId => {
          maxDepLength = Math.max(maxDepLength, calculatePathLength(depId, memo));
        });

        const length = maxDepLength + task.duration;
        memo.set(taskId, length);
        return length;
      };

      const pathLengths = scheduledTasks.map(task => ({
        taskId: task.id,
        length: calculatePathLength(task.id),
      }));

      const maxPathLength = Math.max(...pathLengths.map(p => p.length));
      const criticalTasks = pathLengths
        .filter(p => p.length === maxPathLength)
        .map(p => scheduledTasks.find(t => t.id === p.taskId)!);

      criticalPath.push(...criticalTasks.map(t => t.id));

      // Generate optimizations
      const highPriorityTasks = scheduledTasks.filter(t => t.priority === 'high');
      if (highPriorityTasks.length > 0) {
        optimizations.push(`${highPriorityTasks.length} high-priority tasks identified for close monitoring`);
      }

      const parallelTasks = scheduledTasks.filter(t => t.dependencies.length === 0);
      if (parallelTasks.length > 1) {
        optimizations.push(`${parallelTasks.length} tasks can be started in parallel`);
      }

      const totalDays = Math.ceil((maxEndDate.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
      
      if (totalDays > 90) {
        warnings.push(`Project duration is ${totalDays} days. Consider breaking into phases.`);
      }

      optimizations.push(`Project will complete on ${maxEndDate.toLocaleDateString()}`);
      optimizations.push(`Critical path contains ${criticalTasks.length} tasks`);

      // Build resource allocation map from the scheduling process
      const resourceAllocations = new Map<string, string>();
      scheduledTasks.forEach(task => {
        const bestMemberInfo = findBestMember(task, new Date(task.startDate!));
        if (bestMemberInfo.member) {
          resourceAllocations.set(task.id, bestMemberInfo.member.id);
        }
      });

      // Check workload distribution
      memberWorkload.forEach((data, memberId) => {
        const member = project.teamMembers.find(m => m.id === memberId);
        if (member && data.totalDays > 0) {
          optimizations.push(`Team member "${member.name}" allocated ${data.totalDays} days of work`);
        }
      });

      setScheduleResult({
        tasks: scheduledTasks,
        totalDuration: totalDays,
        criticalPath,
        warnings,
        optimizations,
        resourceAllocations,
      });

      setIsGenerating(false);
    }, 1500);
  };

  const applySchedule = () => {
    if (!scheduleResult) return;
    
    // Reset sprintId for all tasks - they go to backlog after scheduling
    // Project managers will manually assign them to sprints
    const tasksWithoutSprints = scheduleResult.tasks.map(task => ({
      ...task,
      sprintId: undefined,
    }));
    
    // Update sprints to remove all task references
    const updatedSprints = project.sprints.map(sprint => ({
      ...sprint,
      taskIds: [],
    }));
    
    onUpdateProject({ 
      ...project, 
      tasks: tasksWithoutSprints,
      sprints: updatedSprints,
    });
    
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6" />
          <h2>AI-Powered Scheduler</h2>
        </div>
        <p className="text-blue-100">
          Generate an optimized project schedule based on task dependencies, priorities, and durations
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Schedule Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">
              Project Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Tasks</div>
              <div className="text-gray-900">{project.tasks.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">With Dependencies</div>
              <div className="text-gray-900">
                {project.tasks.filter(t => t.dependencies.length > 0).length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">High Priority</div>
              <div className="text-gray-900">
                {project.tasks.filter(t => t.priority === 'high').length}
              </div>
            </div>
          </div>

          <button
            onClick={generateSchedule}
            disabled={isGenerating || project.tasks.length === 0}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate Optimized Schedule
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {scheduleResult && (
        <>
          {/* Summary */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-gray-900 mb-4">Schedule Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Project Duration</span>
                </div>
                <div className="text-blue-900">{scheduleResult.totalDuration} days</div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-700">Critical Path</span>
                </div>
                <div className="text-purple-900">{scheduleResult.criticalPath.length} tasks</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Completion Date</span>
                </div>
                <div className="text-green-900">
                  {new Date(new Date(startDate).getTime() + scheduleResult.totalDuration * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Optimizations */}
            {scheduleResult.optimizations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-gray-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Optimizations
                </h4>
                <ul className="space-y-2">
                  {scheduleResult.optimizations.map((opt, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {scheduleResult.warnings.length > 0 && (
              <div>
                <h4 className="text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Warnings
                </h4>
                <ul className="space-y-2">
                  {scheduleResult.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Task Schedule */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-gray-900 mb-4">Scheduled Tasks</h3>
            
            <div className="space-y-2">
              {scheduleResult.tasks.map((task) => {
                const isCritical = scheduleResult.criticalPath.includes(task.id);
                
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border ${
                      isCritical
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-gray-900">{task.title}</h4>
                          {isCritical && (
                            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                              Critical Path
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Start: {task.startDate}</span>
                          <span>End: {task.endDate}</span>
                          <span>Duration: {task.duration} days</span>
                        </div>
                        {task.dependencies.length > 0 && (
                          <div className="mt-2 text-sm text-gray-600">
                            Dependencies: {task.dependencies.map(depId => {
                              const depTask = project.tasks.find(t => t.id === depId);
                              return depTask?.title;
                            }).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {project.teamMembers.find(m => m.id === scheduleResult.resourceAllocations.get(task.id))?.name || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Apply Button */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 mb-1">Apply This Schedule</h3>
                <p className="text-gray-600 text-sm">
                  This will update all task dates and move them to the kanban backlog. You can then manually assign tasks to sprints for monitoring.
                </p>
              </div>
              <button
                onClick={applySchedule}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Apply Schedule
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}