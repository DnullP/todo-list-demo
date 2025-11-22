import { create } from 'zustand';
import { todoClient } from '../services/todoClient';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  stats: { total: 0, completed: 0, overdue: 0, today: 0 },

  load: async () => {
    const res = await todoClient.listTasks({ status: 'active' });
    if (res && res.ok) set({ tasks: res.data || [] });
    const s = await todoClient.stats();
    if (s && s.ok) set({ stats: s.data || { total: 0, completed: 0, overdue: 0, today: 0 } });
  },

  addTask: async (input) => {
    const res = await todoClient.createTask(input);
    if (res && res.ok) set((state) => ({ tasks: [...state.tasks, res.data] }));
    const s = await todoClient.stats();
    if (s && s.ok) set({ stats: s.data });
  },

  completeTask: async (id) => {
    const res = await todoClient.completeTask(id);
    if (res && res.ok) {
      set((state) => ({ tasks: state.tasks.map((t) => (t.id === id ? res.data : t)) }));
    }
    const s = await todoClient.stats();
    if (s && s.ok) set({ stats: s.data });
  },
}));
