import { useCallback } from 'react';
import { Task, TaskStatus, TaskColor } from '@/types';
import { useLocalStorage } from './useLocalStorage';

const generateId = () => crypto.randomUUID();

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('builderos-tasks', []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
    const now = new Date().toISOString();
    const maxPosition = tasks.filter(t => t.status === task.status).length;
    
    const newTask: Task = {
      ...task,
      id: generateId(),
      position: maxPosition,
      createdAt: now,
      updatedAt: now,
    };
    
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, [tasks, setTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      
      const updatedTask = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      // Auto-set completion date when moved to done
      if (updates.status === 'done' && task.status !== 'done') {
        updatedTask.completedDate = new Date().toISOString();
      }
      
      return updatedTask;
    }));
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [setTasks]);

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus, newPosition: number) => {
    setTasks(prev => {
      const taskToMove = prev.find(t => t.id === taskId);
      if (!taskToMove) return prev;

      const oldStatus = taskToMove.status;
      const tasksInNewColumn = prev.filter(t => t.status === newStatus && t.id !== taskId);
      
      // Update positions in new column
      const updatedTasks = prev.map(task => {
        if (task.id === taskId) {
          const updates: Partial<Task> = {
            status: newStatus,
            position: newPosition,
            updatedAt: new Date().toISOString(),
          };
          
          if (newStatus === 'done' && oldStatus !== 'done') {
            updates.completedDate = new Date().toISOString();
          }
          
          return { ...task, ...updates };
        }
        
        if (task.status === newStatus && task.position >= newPosition) {
          return { ...task, position: task.position + 1 };
        }
        
        return task;
      });
      
      return updatedTasks;
    });
  }, [setTasks]);

  const importTasks = useCallback((newTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>[]) => {
    const now = new Date().toISOString();
    const existingBacklogCount = tasks.filter(t => t.status === 'backlog').length;
    
    const tasksToAdd: Task[] = newTasks.map((task, index) => ({
      ...task,
      id: generateId(),
      position: existingBacklogCount + index,
      createdAt: now,
      updatedAt: now,
    }));
    
    setTasks(prev => [...prev, ...tasksToAdd]);
  }, [tasks, setTasks]);

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => a.position - b.position);
  }, [tasks]);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    importTasks,
    getTasksByStatus,
  };
}
