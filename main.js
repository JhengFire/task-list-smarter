const { app, BrowserWindow, Menu, Tray, ipcMain, Notification, nativeImage, shell } = require('electron');
const fs = require('fs');
const path = require('path');

const defaults = {
  tasks: [],
  scheduledTasks: [],
  settings: {
    autoStart: true,
    minimizeToTray: true,
    language: 'zh',
    lastFilter: 'active',
    alwaysOnTop: false,
    compactPosition: null
  }
};

let mainWindow;
let compactWindow;
const alarmWindows = new Map();
let tray;
let reminderTimer;
let dataFile;
let data = structuredClone(defaults);
let splashWindow;
let splashReady = false;
const gotSingleInstanceLock = app.requestSingleInstanceLock();

function hasOwn(source, key) {
  return Object.prototype.hasOwnProperty.call(source, key);
}

const iconPng = path.join(__dirname, 'assets', 'icon.png');
const iconIco = path.join(__dirname, 'assets', 'icon.ico');
const reminderRules = [
  { key: '24', milliseconds: 24 * 60 * 60 * 1000 },
  { key: '12', milliseconds: 12 * 60 * 60 * 1000 },
  { key: '6', milliseconds: 6 * 60 * 60 * 1000 },
  { key: '3', milliseconds: 3 * 60 * 60 * 1000 },
  { key: '0.5', milliseconds: 30 * 60 * 1000 },
  { key: 'due', milliseconds: 0 }
];

function loadData() {
  dataFile = path.join(app.getPath('userData'), 'todo-data.json');
  try {
    const stored = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    data = {
      tasks: Array.isArray(stored.tasks) ? stored.tasks : [],
      scheduledTasks: Array.isArray(stored.scheduledTasks) ? stored.scheduledTasks : [],
      settings: { ...defaults.settings, ...(stored.settings || {}) }
    };
  } catch {
    data = structuredClone(defaults);
    saveData();
  }
}

function saveData() {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

function storeGet(key) {
  if (key === 'tasks') return data.tasks;
  if (key === 'scheduledTasks') return data.scheduledTasks;
  if (key === 'settings') return data.settings;
  if (key.startsWith('settings.')) return data.settings[key.split('.')[1]];
  return data[key];
}

function storeSet(key, value) {
  if (key === 'tasks') data.tasks = value;
  if (key === 'scheduledTasks') data.scheduledTasks = value;
  if (key === 'settings') data.settings = value;
  saveData();
}

function isEnglish() {
  return storeGet('settings')?.language === 'en';
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 470,
    height: 300,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    show: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: '#f5f1e8',
    icon: iconIco,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'renderer', 'splash.html'));
  return new Promise((resolve) => {
    splashWindow.once('ready-to-show', () => {
      splashReady = true;
      splashWindow.show();
      splashWindow.focus();
      resolve();
    });
  });
}

function updateSplash(progress, statusZh, statusEn) {
  if (!splashReady || !splashWindow || splashWindow.isDestroyed()) return;
  splashWindow.webContents.send('startup-progress', {
    progress,
    status: isEnglish() ? statusEn : statusZh
  });
}

function closeSplashWindow() {
  if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
  splashWindow = null;
  splashReady = false;
}

function createWindow({ show = true } = {}) {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 940,
    minHeight: 620,
    title: isEnglish() ? 'Todo List' : '待办清单',
    icon: iconIco,
    backgroundColor: '#f6f4ef',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  const ready = new Promise((resolve) => {
    mainWindow.once('ready-to-show', () => {
      if (show) mainWindow.show();
      resolve();
    });
  });

  mainWindow.on('close', (event) => {
    const settings = storeGet('settings');
    if (!app.isQuiting && settings.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return ready;
}

function createCompactWindow() {
  if (compactWindow && !compactWindow.isDestroyed()) return compactWindow;

  const settings = storeGet('settings');
  const compactOptions = {
    width: 380,
    height: 500,
    minWidth: 320,
    minHeight: 300,
    maxWidth: 560,
    maxHeight: 760,
    title: isEnglish() ? 'Todo List · Compact window' : '待办清单 · 桌面小窗',
    icon: iconIco,
    frame: false,
    resizable: true,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: Boolean(settings.alwaysOnTop),
    backgroundColor: '#f5f1e8',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  };

  if (Array.isArray(settings.compactPosition) && settings.compactPosition.length === 2) {
    compactOptions.x = settings.compactPosition[0];
    compactOptions.y = settings.compactPosition[1];
  }

  compactWindow = new BrowserWindow(compactOptions);
  compactWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'), { search: '?mode=compact' });
  compactWindow.on('move', saveCompactPosition);
  compactWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      compactWindow.hide();
    }
  });
  compactWindow.on('closed', () => {
    compactWindow = null;
  });
  compactWindow.once('ready-to-show', () => compactWindow.show());
  return compactWindow;
}

function saveCompactPosition() {
  if (!compactWindow || compactWindow.isDestroyed()) return;
  const [x, y] = compactWindow.getPosition();
  const settings = storeGet('settings');
  if (settings.compactPosition?.[0] === x && settings.compactPosition?.[1] === y) return;
  storeSet('settings', { ...settings, compactPosition: [x, y] });
}

function showCompactWindow() {
  const window = createCompactWindow();
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
  if (window.isMinimized()) window.restore();
  window.show();
  window.focus();
}

function hideCompactWindow() {
  if (compactWindow && !compactWindow.isDestroyed()) compactWindow.hide();
}

function showWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) createWindow();
  if (compactWindow && !compactWindow.isDestroyed()) compactWindow.hide();
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function createAlarmWindow(item, reminderRule, kind = 'task') {
  const itemKey = `${kind}:${item.id}`;
  if (alarmWindows.has(itemKey)) {
    const existing = alarmWindows.get(itemKey);
    if (!existing.isDestroyed()) {
      if (reminderRule?.key === 'due') {
        existing.loadFile(path.join(__dirname, 'renderer', 'index.html'), {
          search: kind === 'schedule'
            ? `?mode=alarm&entity=scheduled&scheduleId=${encodeURIComponent(item.id)}&offset=due`
            : `?mode=alarm&taskId=${encodeURIComponent(item.id)}&offset=due`
        });
      }
      existing.show();
      existing.focus();
      return existing;
    }
  }

  const alarmWindow = new BrowserWindow({
    width: 460,
    height: 290,
    minWidth: 380,
    minHeight: 250,
    title: isEnglish() ? 'Todo reminder' : '待办提醒',
    icon: iconIco,
    frame: false,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    skipTaskbar: false,
    alwaysOnTop: true,
    backgroundColor: '#fffdf8',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  alarmWindows.set(itemKey, alarmWindow);
  const offset = reminderRule ? `&offset=${encodeURIComponent(reminderRule.key)}` : '';
  const entity = kind === 'schedule'
    ? `?mode=alarm&entity=scheduled&scheduleId=${encodeURIComponent(item.id)}${offset}`
    : `?mode=alarm&taskId=${encodeURIComponent(item.id)}${offset}`;
  alarmWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'), { search: entity });
  alarmWindow.once('ready-to-show', () => {
    alarmWindow.show();
    alarmWindow.focus();
  });
  alarmWindow.on('closed', () => alarmWindows.delete(itemKey));
  return alarmWindow;
}

function closeAlarmForTask(id) {
  const alarmWindow = alarmWindows.get(`task:${id}`);
  if (alarmWindow && !alarmWindow.isDestroyed()) alarmWindow.close();
  alarmWindows.delete(`task:${id}`);
}

function createTray() {
  const image = nativeImage.createFromPath(iconPng);
  tray = new Tray(image.isEmpty() ? nativeImage.createEmpty() : image.resize({ width: 16, height: 16 }));
  tray.setToolTip(isEnglish() ? 'Todo List' : '待办清单');
  tray.on('click', showWindow);
  refreshTrayMenu();
}

function mainText(key, replacements = {}) {
  const language = storeGet('settings')?.language === 'en' ? 'en' : 'zh';
  const values = {
    zh: {
      pending: '待处理：{count}', next: '下一个提醒：{time}', noReminder: '暂无提醒', open: '打开待办清单',
      compact: '桌面小窗', add: '新增任务', quit: '退出', todoReminder: '待办提醒',
      beforeDeadline: '距离截止还有 {time}', deadlineArrived: '任务已到期',
      scheduledReminder: '定时任务提醒', scheduleBefore: '距离执行还有 {time}', scheduleDue: '定时任务到期'
    },
    en: {
      pending: 'Pending: {count}', next: 'Next reminder: {time}', noReminder: 'No reminders', open: 'Open Todo List',
      compact: 'Compact window', add: 'New task', quit: 'Quit', todoReminder: 'Todo reminder',
      beforeDeadline: '{time} until the deadline', deadlineArrived: 'The task is due',
      scheduledReminder: 'Scheduled task reminder', scheduleBefore: '{time} until the scheduled run', scheduleDue: 'Scheduled task is due'
    }
  }[language];
  let value = values[key] || key;
  Object.entries(replacements).forEach(([name, replacement]) => {
    value = value.replace(`{${name}}`, String(replacement));
  });
  return value;
}

function formatReminderOffset(key) {
  return key === '0.5' ? (isEnglish() ? '30 minutes' : '30分钟') : (isEnglish() ? `${key} hours` : `${key}小时`);
}

function pendingReminderEvents(task, now = Date.now()) {
  if (task.completed || !task.reminderAt) return [];
  const deadline = new Date(task.reminderAt).getTime();
  if (Number.isNaN(deadline)) return [];
  const scheduleStart = new Date(task.reminderBaseAt || Date.now()).getTime();
  const notified = new Set(Array.isArray(task.reminderNotifiedOffsets) ? task.reminderNotifiedOffsets.map(String) : []);
  return reminderRules
    .map((rule) => ({ task, rule, at: deadline - rule.milliseconds }))
    .filter((event) => {
      if (notified.has(event.rule.key) || event.at > now) return false;
      // A missed deadline should still alert once when the app starts again.
      if (event.rule.key === 'due') return true;
      return event.at >= scheduleStart;
    });
}

function normalizeWeekdays(value, scheduleType) {
  const weekdays = Array.isArray(value)
    ? [...new Set(value.map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))]
    : [];
  if (scheduleType === 'weekdays') return [1, 2, 3, 4, 5];
  if (scheduleType === 'weekly') return [weekdays[0] ?? 1];
  if (scheduleType === 'custom') return weekdays.length ? weekdays.sort((a, b) => a - b) : [1];
  return weekdays;
}

function makeScheduledDate(year, month, day, hour, minute) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(Math.max(day, 1), lastDay), hour, minute, 0, 0);
}

function nextScheduledRun(schedule, afterMs = Date.now()) {
  const [hourValue, minuteValue] = String(schedule.time || '09:00').split(':').map(Number);
  const hour = Number.isInteger(hourValue) ? Math.min(Math.max(hourValue, 0), 23) : 9;
  const minute = Number.isInteger(minuteValue) ? Math.min(Math.max(minuteValue, 0), 59) : 0;
  const after = new Date(afterMs);
  const scheduleType = ['daily', 'weekdays', 'weekly', 'monthly', 'custom', 'interval'].includes(schedule.scheduleType)
    ? schedule.scheduleType
    : 'daily';

  if (scheduleType === 'monthly') {
    for (let offset = 0; offset < 24; offset += 1) {
      const candidate = makeScheduledDate(after.getFullYear(), after.getMonth() + offset, Number(schedule.dayOfMonth) || 1, hour, minute);
      if (candidate.getTime() > afterMs) return candidate.toISOString();
    }
  }

  if (scheduleType === 'interval') {
    const intervalDays = Math.max(1, Number(schedule.intervalDays) || 1);
    const anchor = new Date(schedule.anchorAt || afterMs);
    let candidate = makeScheduledDate(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), hour, minute);
    while (candidate.getTime() <= afterMs) {
      candidate.setDate(candidate.getDate() + intervalDays);
    }
    return candidate.toISOString();
  }

  const weekdays = scheduleType === 'weekdays'
    ? [1, 2, 3, 4, 5]
    : scheduleType === 'weekly'
      ? [Number(schedule.weekdays?.[0] ?? 1)]
      : scheduleType === 'custom'
        ? normalizeWeekdays(schedule.weekdays, scheduleType)
        : null;

  for (let offset = 0; offset < 370; offset += 1) {
    const candidateDate = new Date(after.getFullYear(), after.getMonth(), after.getDate() + offset);
    if (weekdays && !weekdays.includes(candidateDate.getDay())) continue;
    const candidate = makeScheduledDate(candidateDate.getFullYear(), candidateDate.getMonth(), candidateDate.getDate(), hour, minute);
    if (candidate.getTime() > afterMs) return candidate.toISOString();
  }

  return new Date(afterMs + 24 * 60 * 60 * 1000).toISOString();
}

function pendingScheduledReminderEvents(schedule, now = Date.now()) {
  if (!schedule.enabled || !schedule.nextRunAt) return [];
  const runAt = new Date(schedule.nextRunAt).getTime();
  if (Number.isNaN(runAt)) return [];
  const runKey = schedule.nextRunAt;
  const events = [];
  const advanceMinutes = Math.max(0, Number(schedule.advanceMinutes) || 0);
  const advanceAt = runAt - advanceMinutes * 60000;
  if (advanceAt > now && advanceMinutes > 0 && schedule.advanceNotifiedFor !== runKey) {
    events.push({ schedule, key: 'advance', at: advanceAt });
  }
  if (runAt > now && schedule.dueNotifiedFor !== runKey) {
    events.push({ schedule, key: 'due', at: runAt });
  }
  return events.sort((a, b) => a.at - b.at);
}

function refreshTrayMenu() {
  if (!tray) return;
  const tasks = storeGet('tasks');
  const scheduledTasks = storeGet('scheduledTasks');
  const activeCount = tasks.filter((task) => !task.completed).length;
  const nextTaskReminder = tasks
    .flatMap((task) => pendingReminderEvents(task))
    .sort((a, b) => a.at - b.at)[0];
  const nextScheduleReminder = scheduledTasks
    .flatMap((schedule) => pendingScheduledReminderEvents(schedule))
    .sort((a, b) => a.at - b.at)[0];
  const nextReminder = [nextTaskReminder, nextScheduleReminder]
    .filter(Boolean)
    .sort((a, b) => a.at - b.at)[0];

  tray.setContextMenu(Menu.buildFromTemplate([
    { label: mainText('pending', { count: activeCount }), enabled: false },
    nextReminder ? { label: mainText('next', { time: formatTrayTime(nextReminder.at) }), enabled: false } : { label: mainText('noReminder'), enabled: false },
    { type: 'separator' },
    { label: mainText('open'), click: showWindow },
    { label: mainText('compact'), click: showCompactWindow },
    { label: mainText('add'), click: () => { showWindow(); mainWindow.webContents.send('focus-new-task'); } },
    { type: 'separator' },
    { label: mainText('quit'), click: () => { app.isQuiting = true; app.quit(); } }
  ]));
}

function formatTrayTime(value) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function sendTasksChanged() {
  BrowserWindow.getAllWindows().forEach((window) => {
    if (!window.isDestroyed()) window.webContents.send('tasks-updated', storeGet('tasks'));
  });
  refreshTrayMenu();
}

function sendScheduledTasksChanged() {
  BrowserWindow.getAllWindows().forEach((window) => {
    if (!window.isDestroyed()) window.webContents.send('scheduled-tasks-updated', storeGet('scheduledTasks'));
  });
  refreshTrayMenu();
}

function sendSettingsChanged() {
  BrowserWindow.getAllWindows().forEach((window) => {
    if (!window.isDestroyed()) window.webContents.send('settings-updated', storeGet('settings'));
  });
  refreshTrayMenu();
}

function normalizeTask(input, previous = {}) {
  const now = new Date().toISOString();
  const completed = hasOwn(input, 'completed') ? Boolean(input.completed) : Boolean(previous.completed ?? false);
  const nextReminderAt = hasOwn(input, 'reminderAt') ? (input.reminderAt || null) : (previous.reminderAt || null);
  const reminderChanged = previous.id && previous.reminderAt !== nextReminderAt;
  const reminderNotifiedOffsets = Array.isArray(input.reminderNotifiedOffsets)
    ? [...new Set(input.reminderNotifiedOffsets.map(String))]
    : (Array.isArray(previous.reminderNotifiedOffsets) ? [...new Set(previous.reminderNotifiedOffsets.map(String))] : []);
  return {
    id: previous.id || String(Date.now()) + Math.random().toString(16).slice(2),
    title: String(hasOwn(input, 'title') ? input.title : (previous.title || '')).trim(),
    notes: String(hasOwn(input, 'notes') ? input.notes : (previous.notes || '')),
    priority: ['low', 'medium', 'high'].includes(input.priority) ? input.priority : (previous.priority || 'medium'),
    reminderAt: nextReminderAt,
    reminderBaseAt: hasOwn(input, 'reminderBaseAt')
      ? (input.reminderBaseAt || now)
      : (reminderChanged ? now : (previous.reminderBaseAt || now)),
    startedAt: hasOwn(input, 'startedAt') ? (input.startedAt || null) : (previous.startedAt || null),
    completed,
    createdAt: previous.createdAt || now,
    updatedAt: now,
    completedAt: completed ? (previous.completedAt || now) : null,
    notifiedAt: hasOwn(input, 'notifiedAt') ? input.notifiedAt : (previous.notifiedAt ?? null),
    reminderNotifiedOffsets,
    postponedCount: Number.isFinite(Number(input.postponedCount)) ? Number(input.postponedCount) : Number(previous.postponedCount || 0),
    lastPostponedAt: hasOwn(input, 'lastPostponedAt') ? input.lastPostponedAt : (previous.lastPostponedAt ?? null)
  };
}

function normalizeScheduledTask(input, previous = {}) {
  const now = new Date().toISOString();
  const scheduleType = ['daily', 'weekdays', 'weekly', 'monthly', 'custom', 'interval'].includes(input.scheduleType)
    ? input.scheduleType
    : (previous.scheduleType || 'daily');
  const time = /^\d{2}:\d{2}$/.test(String(input.time || previous.time || '09:00'))
    ? String(input.time || previous.time || '09:00')
    : '09:00';
  const base = {
    id: previous.id || String(Date.now()) + Math.random().toString(16).slice(2),
    title: String(hasOwn(input, 'title') ? input.title : (previous.title || '')).trim(),
    notes: String(hasOwn(input, 'notes') ? input.notes : (previous.notes || '')),
    time,
    scheduleType,
    weekdays: normalizeWeekdays(hasOwn(input, 'weekdays') ? input.weekdays : previous.weekdays, scheduleType),
    dayOfMonth: Math.min(31, Math.max(1, Number(input.dayOfMonth ?? previous.dayOfMonth ?? 1) || 1)),
    intervalDays: Math.min(365, Math.max(1, Number(input.intervalDays ?? previous.intervalDays ?? 1) || 1)),
    advanceMinutes: [0, 5, 10, 15, 30, 60, 1440].includes(Number(input.advanceMinutes ?? previous.advanceMinutes))
      ? Number(input.advanceMinutes ?? previous.advanceMinutes)
      : 15,
    enabled: hasOwn(input, 'enabled') ? Boolean(input.enabled) : (previous.enabled !== false),
    anchorAt: previous.anchorAt || now,
    createdAt: previous.createdAt || now,
    updatedAt: now,
    advanceNotifiedFor: hasOwn(input, 'advanceNotifiedFor') ? input.advanceNotifiedFor : (previous.advanceNotifiedFor || null),
    dueNotifiedFor: hasOwn(input, 'dueNotifiedFor') ? input.dueNotifiedFor : (previous.dueNotifiedFor || null)
  };
  return {
    ...base,
    nextRunAt: hasOwn(input, 'nextRunAt') ? input.nextRunAt : nextScheduledRun(base, Date.now())
  };
}

function checkReminders() {
  const tasks = storeGet('tasks');
  const now = Date.now();
  let changed = false;

  const nextTasks = tasks.map((task) => {
    const dueEvents = pendingReminderEvents(task, now);
    if (!dueEvents.length) return task;

    // If the app was closed across several reminders, the deadline alert is
    // the most useful one to show in the single alarm window.
    const eventsToShow = dueEvents.some((event) => event.rule.key === 'due')
      ? dueEvents.filter((event) => event.rule.key === 'due')
      : dueEvents;
    eventsToShow.forEach((event) => showReminder(task, event.rule));
    changed = true;
    const notifiedOffsets = new Set(Array.isArray(task.reminderNotifiedOffsets) ? task.reminderNotifiedOffsets.map(String) : []);
    dueEvents.forEach((event) => notifiedOffsets.add(event.rule.key));
    return {
      ...task,
      notifiedAt: new Date().toISOString(),
      reminderNotifiedOffsets: [...notifiedOffsets]
    };
  });

  if (changed) {
    storeSet('tasks', nextTasks);
    sendTasksChanged();
  }
}

function checkScheduledReminders() {
  const schedules = storeGet('scheduledTasks');
  const now = Date.now();
  let changed = false;

  const nextSchedules = schedules.map((schedule) => {
    if (!schedule.enabled) return schedule;
    let nextRunAt = schedule.nextRunAt;
    const runAt = new Date(nextRunAt).getTime();
    if (Number.isNaN(runAt)) {
      nextRunAt = nextScheduledRun(schedule, now);
    }
    const currentRunAt = new Date(nextRunAt).getTime();
    const runKey = nextRunAt;
    if (currentRunAt <= now) {
      showScheduleReminder(schedule, { key: 'due' });
      const nextRun = nextScheduledRun(schedule, now);
      changed = true;
      return {
        ...schedule,
        nextRunAt: nextRun,
        dueNotifiedFor: runKey,
        advanceNotifiedFor: runKey,
        updatedAt: new Date().toISOString()
      };
    }

    const advanceMinutes = Math.max(0, Number(schedule.advanceMinutes) || 0);
    const advanceAt = currentRunAt - advanceMinutes * 60000;
    if (advanceMinutes > 0 && now >= advanceAt && schedule.advanceNotifiedFor !== runKey) {
      showScheduleReminder(schedule, { key: 'advance' });
      changed = true;
      return { ...schedule, advanceNotifiedFor: runKey, updatedAt: new Date().toISOString() };
    }

    if (nextRunAt !== schedule.nextRunAt) {
      changed = true;
      return { ...schedule, nextRunAt, updatedAt: new Date().toISOString() };
    }
    return schedule;
  });

  if (changed) {
    storeSet('scheduledTasks', nextSchedules);
    sendScheduledTasksChanged();
  }
}

function showReminder(task, reminderRule) {
  const beforeDeadline = reminderRule?.key === 'due'
    ? mainText('deadlineArrived')
    : reminderRule
      ? mainText('beforeDeadline', { time: formatReminderOffset(reminderRule.key) })
      : '';
  const notification = new Notification({
    title: mainText('todoReminder'),
    body: [task.title, beforeDeadline, task.notes].filter(Boolean).join('\n'),
    icon: iconPng,
    silent: false
  });

  notification.on('click', () => {
    showWindow();
    mainWindow.webContents.send('select-task', task.id);
  });

  notification.show();
  createAlarmWindow(task, reminderRule);
}

function showScheduleReminder(schedule, reminderRule) {
  const isDue = reminderRule?.key === 'due';
  const reminderText = isDue
    ? mainText('scheduleDue')
    : mainText('scheduleBefore', { time: formatScheduleAdvance(schedule.advanceMinutes) });
  const notification = new Notification({
    title: mainText('scheduledReminder'),
    body: [schedule.title, reminderText, schedule.notes].filter(Boolean).join('\n'),
    icon: iconPng,
    silent: false
  });

  notification.on('click', () => {
    showWindow();
    mainWindow.webContents.send('select-schedule', schedule.id);
  });

  notification.show();
  createAlarmWindow(schedule, reminderRule, 'schedule');
}

function formatScheduleAdvance(minutes) {
  if (Number(minutes) >= 1440) return isEnglish() ? '1 day' : '1天';
  if (Number(minutes) >= 60) return isEnglish() ? `${Number(minutes) / 60} hours` : `${Number(minutes) / 60}小时`;
  return isEnglish() ? `${minutes} minutes` : `${minutes}分钟`;
}

function applyAutoLaunch(enabled) {
  app.setLoginItemSettings({
    openAtLogin: Boolean(enabled),
    path: process.execPath,
    args: process.defaultApp ? [path.resolve(process.argv[1])] : []
  });
}

function updateTaskReminder(id, reminderAt) {
  let updatedTask;
  const rescheduledAt = new Date().toISOString();
  const tasks = storeGet('tasks').map((task) => {
    if (task.id !== id || task.completed) return task;
    const nextTime = new Date(reminderAt).getTime();
    if (Number.isNaN(nextTime)) return task;
    updatedTask = normalizeTask({
      ...task,
      reminderAt: new Date(nextTime).toISOString(),
      reminderBaseAt: rescheduledAt,
      notifiedAt: null,
      reminderNotifiedOffsets: [],
      postponedCount: Number(task.postponedCount || 0) + 1,
      lastPostponedAt: rescheduledAt
    }, task);
    updatedTask.notifiedAt = null;
    updatedTask.reminderNotifiedOffsets = [];
    return updatedTask;
  });
  if (!updatedTask) return null;
  storeSet('tasks', tasks);
  sendTasksChanged();
  checkReminders();
  return updatedTask;
}

function editTaskInMain(id) {
  showWindow();
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (id) mainWindow.webContents.send('edit-task', id);
  else mainWindow.webContents.send('focus-new-task');
}

function registerIpc() {
  ipcMain.handle('get-state', () => ({
    tasks: storeGet('tasks'),
    scheduledTasks: storeGet('scheduledTasks'),
    settings: storeGet('settings'),
    loginItem: app.getLoginItemSettings()
  }));

  ipcMain.handle('create-task', (_event, task) => {
    const normalized = normalizeTask(task);
    if (!normalized.title) throw new Error('任务标题不能为空');
    const tasks = [normalized, ...storeGet('tasks')];
    storeSet('tasks', tasks);
    sendTasksChanged();
    return normalized;
  });

  ipcMain.handle('update-task', (_event, id, patch) => {
    let updatedTask;
    const tasks = storeGet('tasks').map((task) => {
      if (task.id !== id) return task;
      updatedTask = normalizeTask({ ...task, ...patch }, task);
      if (task.reminderAt !== updatedTask.reminderAt || (task.completed && !updatedTask.completed)) {
        updatedTask.notifiedAt = null;
        updatedTask.reminderNotifiedOffsets = [];
      }
      return updatedTask;
    });
    storeSet('tasks', tasks);
    sendTasksChanged();
    return updatedTask;
  });

  ipcMain.handle('create-scheduled-task', (_event, schedule) => {
    const normalized = normalizeScheduledTask(schedule);
    if (!normalized.title) throw new Error('定时任务标题不能为空');
    const schedules = [normalized, ...storeGet('scheduledTasks')];
    storeSet('scheduledTasks', schedules);
    sendScheduledTasksChanged();
    checkScheduledReminders();
    return normalized;
  });

  ipcMain.handle('update-scheduled-task', (_event, id, patch) => {
    let updatedSchedule;
    const schedules = storeGet('scheduledTasks').map((schedule) => {
      if (schedule.id !== id) return schedule;
      const scheduleFields = ['time', 'scheduleType', 'weekdays', 'dayOfMonth', 'intervalDays'];
      const scheduleChanged = scheduleFields.some((field) => JSON.stringify(schedule[field]) !== JSON.stringify(patch[field] ?? schedule[field]));
      const enabledChanged = hasOwn(patch, 'enabled') && Boolean(patch.enabled) !== Boolean(schedule.enabled);
      const nextPatch = { ...schedule, ...patch };
      if (scheduleChanged || (enabledChanged && patch.enabled)) {
        nextPatch.nextRunAt = nextScheduledRun(nextPatch, Date.now());
        nextPatch.advanceNotifiedFor = null;
        nextPatch.dueNotifiedFor = null;
      }
      updatedSchedule = normalizeScheduledTask(nextPatch, schedule);
      return updatedSchedule;
    });
    if (!updatedSchedule) return null;
    storeSet('scheduledTasks', schedules);
    sendScheduledTasksChanged();
    checkScheduledReminders();
    return updatedSchedule;
  });

  ipcMain.handle('delete-scheduled-task', (_event, id) => {
    const schedules = storeGet('scheduledTasks').filter((schedule) => schedule.id !== id);
    storeSet('scheduledTasks', schedules);
    sendScheduledTasksChanged();
    return true;
  });

  ipcMain.handle('start-task', (_event, id) => {
    let startedTask;
    const startedAt = new Date().toISOString();
    const tasks = storeGet('tasks').map((task) => {
      if (task.id !== id || task.completed || task.startedAt) return task;
      startedTask = normalizeTask({ ...task, startedAt }, task);
      return startedTask;
    });
    if (!startedTask) return null;
    storeSet('tasks', tasks);
    sendTasksChanged();
    return startedTask;
  });

  ipcMain.handle('delete-task', (_event, id) => {
    const tasks = storeGet('tasks').filter((task) => task.id !== id);
    storeSet('tasks', tasks);
    sendTasksChanged();
    return true;
  });

  ipcMain.handle('clear-completed', () => {
    const tasks = storeGet('tasks').filter((task) => !task.completed);
    storeSet('tasks', tasks);
    sendTasksChanged();
    return tasks;
  });

  ipcMain.handle('update-settings', (_event, patch) => {
    const settings = { ...storeGet('settings'), ...patch };
    storeSet('settings', settings);
    if (hasOwn(patch, 'autoStart')) {
      applyAutoLaunch(settings.autoStart);
    }
    if (hasOwn(patch, 'language')) {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.setTitle(settings.language === 'en' ? 'Todo List' : '待办清单');
      if (compactWindow && !compactWindow.isDestroyed()) compactWindow.setTitle(settings.language === 'en' ? 'Todo List · Compact window' : '待办清单 · 桌面小窗');
    }
    sendSettingsChanged();
    return settings;
  });

  ipcMain.handle('open-data-folder', () => {
    shell.openPath(app.getPath('userData'));
    return app.getPath('userData');
  });

  ipcMain.handle('open-compact', () => {
    showCompactWindow();
    return true;
  });

  ipcMain.handle('show-main', () => {
    showWindow();
    return true;
  });

  ipcMain.handle('hide-compact', () => {
    hideCompactWindow();
    return true;
  });

  ipcMain.handle('close-current-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window && !window.isDestroyed()) window.close();
    return true;
  });

  ipcMain.handle('edit-task', (_event, id) => {
    if (id) closeAlarmForTask(id);
    editTaskInMain(id);
    return true;
  });

  ipcMain.handle('postpone-task', (_event, id, reminderAt) => {
    return updateTaskReminder(id, reminderAt);
  });

  ipcMain.handle('set-always-on-top', (_event, enabled) => {
    const alwaysOnTop = Boolean(enabled);
    if (compactWindow && !compactWindow.isDestroyed()) compactWindow.setAlwaysOnTop(alwaysOnTop, 'floating');
    storeSet('settings', { ...storeGet('settings'), alwaysOnTop });
    return alwaysOnTop;
  });
}

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      showWindow();
    } else if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.show();
      splashWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    app.setAppUserModelId('com.codex.todo.desktop');

    await createSplashWindow();
    updateSplash(8, '正在准备应用...', 'Preparing the application...');
    await wait(80);

    loadData();
    splashWindow?.webContents.send('startup-language', { language: isEnglish() ? 'en' : 'zh' });
    updateSplash(30, '正在加载任务数据...', 'Loading task data...');
    await wait(80);

    applyAutoLaunch(storeGet('settings.autoStart'));
    updateSplash(48, '正在配置系统服务...', 'Configuring system services...');
    registerIpc();
    updateSplash(62, '正在创建主界面...', 'Creating the main window...');
    createTray();
    const mainReady = createWindow({ show: false });
    updateSplash(76, '正在加载工作台...', 'Loading the workspace...');
    await mainReady;
    updateSplash(94, '正在完成启动...', 'Finishing startup...');

    reminderTimer = setInterval(() => {
      checkReminders();
      checkScheduledReminders();
    }, 15000);
    checkReminders();
    checkScheduledReminders();
    await wait(180);
    updateSplash(100, '启动完成', 'Ready');
    await wait(120);
    closeSplashWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
      showWindow();
    });
  });
}

app.on('before-quit', () => {
  app.isQuiting = true;
  if (reminderTimer) clearInterval(reminderTimer);
});

app.on('window-all-closed', () => {
  if (!storeGet('settings').minimizeToTray) app.quit();
});
