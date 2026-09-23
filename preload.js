const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('todoApi', {
  getState: () => ipcRenderer.invoke('get-state'),
  createTask: (task) => ipcRenderer.invoke('create-task', task),
  updateTask: (id, patch) => ipcRenderer.invoke('update-task', id, patch),
  createScheduledTask: (task) => ipcRenderer.invoke('create-scheduled-task', task),
  updateScheduledTask: (id, patch) => ipcRenderer.invoke('update-scheduled-task', id, patch),
  deleteScheduledTask: (id) => ipcRenderer.invoke('delete-scheduled-task', id),
  startTask: (id) => ipcRenderer.invoke('start-task', id),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
  clearCompleted: () => ipcRenderer.invoke('clear-completed'),
  updateSettings: (patch) => ipcRenderer.invoke('update-settings', patch),
  openDataFolder: () => ipcRenderer.invoke('open-data-folder'),
  openCompact: () => ipcRenderer.invoke('open-compact'),
  showMain: () => ipcRenderer.invoke('show-main'),
  hideCompact: () => ipcRenderer.invoke('hide-compact'),
  closeCurrentWindow: () => ipcRenderer.invoke('close-current-window'),
  editTask: (id) => ipcRenderer.invoke('edit-task', id),
  postponeTask: (id, reminderAt) => ipcRenderer.invoke('postpone-task', id, reminderAt),
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke('set-always-on-top', enabled),
  onTasksUpdated: (callback) => {
    const listener = (_event, tasks) => callback(tasks);
    ipcRenderer.on('tasks-updated', listener);
    return () => ipcRenderer.removeListener('tasks-updated', listener);
  },
  onScheduledTasksUpdated: (callback) => {
    const listener = (_event, tasks) => callback(tasks);
    ipcRenderer.on('scheduled-tasks-updated', listener);
    return () => ipcRenderer.removeListener('scheduled-tasks-updated', listener);
  },
  onSettingsUpdated: (callback) => {
    const listener = (_event, settings) => callback(settings);
    ipcRenderer.on('settings-updated', listener);
    return () => ipcRenderer.removeListener('settings-updated', listener);
  },
  onStartupProgress: (callback) => {
    const listener = (_event, progress) => callback(progress);
    ipcRenderer.on('startup-progress', listener);
    return () => ipcRenderer.removeListener('startup-progress', listener);
  },
  onStartupLanguage: (callback) => {
    const listener = (_event, language) => callback(language);
    ipcRenderer.on('startup-language', listener);
    return () => ipcRenderer.removeListener('startup-language', listener);
  },
  onFocusNewTask: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('focus-new-task', listener);
    return () => ipcRenderer.removeListener('focus-new-task', listener);
  },
  onSelectTask: (callback) => {
    const listener = (_event, id) => callback(id);
    ipcRenderer.on('select-task', listener);
    return () => ipcRenderer.removeListener('select-task', listener);
  },
  onSelectSchedule: (callback) => {
    const listener = (_event, id) => callback(id);
    ipcRenderer.on('select-schedule', listener);
    return () => ipcRenderer.removeListener('select-schedule', listener);
  },
  onEditTask: (callback) => {
    const listener = (_event, id) => callback(id);
    ipcRenderer.on('edit-task', listener);
    return () => ipcRenderer.removeListener('edit-task', listener);
  }
});
