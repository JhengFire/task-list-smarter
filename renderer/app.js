const state = {
  tasks: [],
  scheduledTasks: [],
  settings: {},
  filter: 'active',
  view: 'tasks',
  search: '',
  editingId: null,
  editingScheduleId: null,
  scheduleCycle: 'daily',
  postponingId: null,
  mode: new URLSearchParams(window.location.search).get('mode') || 'main',
  alarmTaskId: new URLSearchParams(window.location.search).get('taskId'),
  alarmScheduleId: new URLSearchParams(window.location.search).get('scheduleId'),
  alarmOffset: new URLSearchParams(window.location.search).get('offset')
};

const labels = {
  overdue: 'overdue',
  active: 'active',
  today: 'today',
  all: 'all',
  completed: 'completed'
};

const priorityLabels = {
  high: 'priorityHigh',
  medium: 'priorityMedium',
  low: 'priorityLow'
};

const reminderRules = [
  { key: '24', milliseconds: 24 * 60 * 60 * 1000 },
  { key: '12', milliseconds: 12 * 60 * 60 * 1000 },
  { key: '6', milliseconds: 6 * 60 * 60 * 1000 },
  { key: '3', milliseconds: 3 * 60 * 60 * 1000 },
  { key: '0.5', milliseconds: 30 * 60 * 1000 },
  { key: 'due', milliseconds: 0 }
];

const translations = {
  zh: {
    appName: '待办清单', brandMark: '待', taskNavigation: '任务导航', taskFilters: '筛选任务', workspace: '任务工作台',
    overdue: '超期未处理', active: '进行中', today: '今天提醒', all: '全部任务', completed: '已完成', settings: '设置',
    clearCompleted: '清理已完成', compactWindow: '桌面小窗', newTask: '新增任务', addTask: '+ 新增任务',
    taskContent: '任务内容', taskPlaceholder: '例如：17:30 前整理今日事项', reminderTime: '截止时间', priority: '优先级',
    priorityMedium: '普通', priorityHigh: '重要', priorityLow: '低优先', notes: '备注', notesPlaceholder: '可以写地点、链接、补充说明',
    cancelEdit: '取消编辑', saveTask: '保存任务', updateTask: '更新任务', search: '搜索', searchPlaceholder: '输入关键字筛选',
    emptyTitle: '这里很清爽', emptyDescription: '添加一个任务，设置提醒时间，程序隐藏到后台也会继续提醒。',
    compactAriaLabel: '待办桌面小窗', inProgress: '正在进行', pin: '置顶', pinned: '已置顶', openMain: '打开完整窗口',
    hideCompact: '回到后台', noActiveTasks: '当前没有进行中的任务', dragToMove: '拖动标题栏移动', alarmAriaLabel: '待办提醒弹框',
    todoReminder: '待办提醒', reminderArrived: '提醒到了', close: '关闭', complete: '完成', postpone: '延期', edit: '编辑',
    delete: '删除任务', toggleComplete: '切换完成状态', preferences: '偏好设置', language: '语言', chinese: '简体中文',
    english: 'English', autoStart: '开机自动启动', minimizeToTray: '关闭窗口时后台常驻', alwaysOnTop: '桌面小窗置顶',
    openDataFolder: '打开数据目录', taskSchedule: '任务安排', postponeTask: '延期任务', newReminderTime: '新的截止时间',
    cancel: '取消', confirmPostpone: '确认延期', noReminder: '未设置提醒', reminder: '提醒 {time}', completedTag: '已完成',
    created: '创建 {date}', postponed: '延期 {count} 次', elapsed: '已耗时 {hours} 小时', elapsedShort: '耗时 {hours} 小时',
    startTask: '开始', started: '已开始', notStarted: '未开始', startedAt: '开始于 {time}',
    nextReminder: '下一个提醒：{time} · {title}', noReminders: '暂无提醒', noReminderTime: '无提醒', pendingCount: '{count} 项待处理',
    noPending: '没有待处理任务', reminderTimeReached: '你设置的截止时间已经到了。', reminderTimeLabel: '截止时间：{time}', deadlineReminder: '截止前 {time} 提醒', futureTime: '请选择未来的时间。'
    ,scheduledTasks: '定时任务', scheduleEyebrow: '自动化安排', schedulePageTitle: '定时任务',
    schedulePageDescription: '用点击选择的方式安排重复提醒，到点和提前提醒都会通知你。', scheduleActive: '个启用中',
    scheduleSetup: 'SCHEDULE SETUP', createSchedule: '创建定时任务', editSchedule: '编辑定时任务',
    scheduleFormHint: '不需要编辑 Cron 表达式', scheduleTaskName: '任务内容',
    scheduleTaskPlaceholder: '例如：晨间整理、服药、站会', runTime: '执行时间', advanceReminder: '提前提醒',
    advanceNone: '到点提醒', cycle: '周期', cycleDaily: '每天', cycleWeekdays: '工作日',
    cycleWeekly: '每周', cycleMonthly: '每月', cycleCustom: '自定义星期', cycleInterval: '每隔几天',
    cycleDailyHint: '每天执行一次', cycleWeekdaysHint: '周一至周五执行', cycleWeeklyHint: '每周在选定的星期执行',
    cycleMonthlyHint: '每月在指定日期执行', cycleCustomHint: '在选定的星期执行', cycleIntervalHint: '从创建日起按间隔重复',
    weekdayHint: '选择执行日', monthDay: '每月第几天', intervalDays: '间隔天数', nextExecution: '下一次执行',
    scheduleNotesPlaceholder: '可以补充地点、链接或执行说明', saveSchedule: '保存定时任务', yourSchedules: '你的安排',
    scheduleListTitle: '已创建的定时任务', scheduleEmptyTitle: '还没有定时任务',
    scheduleEmptyDescription: '创建一个重复提醒，它会按周期自动运行。', scheduleEnabled: '已启用',
    schedulePaused: '已暂停', scheduleNext: '下次：{time}', scheduleAdvance: '提前 {time}',
    scheduleEveryDay: '每天', scheduleEveryWeekday: '工作日', scheduleEveryWeek: '每周{days}',
    scheduleEveryMonth: '每月 {day} 日', scheduleCustomDays: '每周{days}', scheduleEveryInterval: '每隔 {days} 天',
    scheduleAlarmAdvance: '距离本次执行还有 {time}。', scheduleAlarmDue: '本次定时任务到了。', acknowledge: '知道了'
  },
  en: {
    appName: 'Todo List', brandMark: 'T', taskNavigation: 'Task navigation', taskFilters: 'Task filters', workspace: 'Task workspace',
    overdue: 'Overdue', active: 'Active', today: 'Due today', all: 'All tasks', completed: 'Completed', settings: 'Settings',
    clearCompleted: 'Clear completed', compactWindow: 'Compact window', newTask: 'New task', addTask: '+ New task',
    taskContent: 'Task', taskPlaceholder: "e.g. Organize today's tasks before 5:30 PM", reminderTime: 'Deadline', priority: 'Priority',
    priorityMedium: 'Medium', priorityHigh: 'High', priorityLow: 'Low', notes: 'Notes', notesPlaceholder: 'Add a place, link, or extra context',
    cancelEdit: 'Cancel editing', saveTask: 'Save task', updateTask: 'Update task', search: 'Search', searchPlaceholder: 'Filter by keyword',
    emptyTitle: 'Nothing here yet', emptyDescription: 'Add a task and set a reminder. Notifications keep working while the app is in the background.',
    compactAriaLabel: 'Compact todo window', inProgress: 'In progress', pin: 'Pin', pinned: 'Pinned', openMain: 'Open full window',
    hideCompact: 'Hide to tray', noActiveTasks: 'No active tasks', dragToMove: 'Drag the title bar to move', alarmAriaLabel: 'Todo reminder dialog',
    todoReminder: 'TODO REMINDER', reminderArrived: 'Reminder is due', close: 'Close', complete: 'Complete', postpone: 'Postpone', edit: 'Edit',
    delete: 'Delete task', toggleComplete: 'Toggle completion', preferences: 'PREFERENCES', language: 'Language', chinese: '简体中文',
    english: 'English', autoStart: 'Launch at startup', minimizeToTray: 'Keep running in tray when closed', alwaysOnTop: 'Keep compact window on top',
    openDataFolder: 'Open data folder', taskSchedule: 'TASK SCHEDULE', postponeTask: 'Postpone task', newReminderTime: 'New deadline',
    cancel: 'Cancel', confirmPostpone: 'Confirm postponement', noReminder: 'No reminder', reminder: 'Reminder {time}', completedTag: 'Completed',
    created: 'Created {date}', postponed: 'Postponed {count} times', elapsed: '{hours} h elapsed', elapsedShort: '{hours} h',
    startTask: 'Start', started: 'Started', notStarted: 'Not started', startedAt: 'Started {time}',
    nextReminder: 'Next reminder: {time} · {title}', noReminders: 'No reminders', noReminderTime: 'No reminder', pendingCount: '{count} pending',
    noPending: 'No pending tasks', reminderTimeReached: 'The deadline has arrived.', reminderTimeLabel: 'Deadline: {time}', deadlineReminder: 'Reminder {time} before the deadline', futureTime: 'Choose a future time.'
    ,scheduledTasks: 'Scheduled tasks', scheduleEyebrow: 'AUTOMATION', schedulePageTitle: 'Scheduled tasks',
    schedulePageDescription: 'Set recurring reminders with clicks. You will be notified before and at the scheduled time.', scheduleActive: 'active',
    scheduleSetup: 'SCHEDULE SETUP', createSchedule: 'Create scheduled task', editSchedule: 'Edit scheduled task',
    scheduleFormHint: 'No Cron expression required', scheduleTaskName: 'Task', scheduleTaskPlaceholder: 'e.g. Morning review, medication, stand-up',
    runTime: 'Run time', advanceReminder: 'Advance reminder', advanceNone: 'At run time', cycle: 'Cycle',
    cycleDaily: 'Every day', cycleWeekdays: 'Weekdays', cycleWeekly: 'Weekly', cycleMonthly: 'Monthly',
    cycleCustom: 'Custom weekdays', cycleInterval: 'Every few days', cycleDailyHint: 'Runs every day',
    cycleWeekdaysHint: 'Runs Monday through Friday', cycleWeeklyHint: 'Runs weekly on the selected day',
    cycleMonthlyHint: 'Runs on the selected day of each month', cycleCustomHint: 'Runs on the selected weekdays',
    cycleIntervalHint: 'Repeats from the creation date', weekdayHint: 'Choose run days', monthDay: 'Day of month',
    intervalDays: 'Interval in days', nextExecution: 'Next execution', scheduleNotesPlaceholder: 'Add a place, link, or execution note',
    saveSchedule: 'Save scheduled task', yourSchedules: 'YOUR SCHEDULES', scheduleListTitle: 'Created scheduled tasks',
    scheduleEmptyTitle: 'No scheduled tasks yet', scheduleEmptyDescription: 'Create a recurring reminder and it will run automatically.',
    scheduleEnabled: 'Enabled', schedulePaused: 'Paused', scheduleNext: 'Next: {time}', scheduleAdvance: '{time} early',
    scheduleEveryDay: 'Every day', scheduleEveryWeekday: 'Weekdays', scheduleEveryWeek: 'Every {days}',
    scheduleEveryMonth: 'Monthly on day {day}', scheduleCustomDays: 'Every {days}', scheduleEveryInterval: 'Every {days} days',
    scheduleAlarmAdvance: '{time} until this scheduled run.', scheduleAlarmDue: 'This scheduled task is due.', acknowledge: 'Got it'
  }
};

const els = {
  todayLabel: document.querySelector('#todayLabel'),
  viewTitle: document.querySelector('#viewTitle'),
  filters: [...document.querySelectorAll('.filter')],
  overdueCount: document.querySelector('#overdueCount'),
  activeCount: document.querySelector('#activeCount'),
  todayCount: document.querySelector('#todayCount'),
  allCount: document.querySelector('#allCount'),
  doneCount: document.querySelector('#doneCount'),
  scheduledTasksButton: document.querySelector('#scheduledTasksButton'),
  scheduledCount: document.querySelector('#scheduledCount'),
  mainTopbar: document.querySelector('#mainTopbar'),
  taskWorkspaceView: document.querySelector('#taskWorkspaceView'),
  scheduleView: document.querySelector('#scheduleView'),
  scheduleActiveCount: document.querySelector('#scheduleActiveCount'),
  scheduleForm: document.querySelector('#scheduleForm'),
  scheduleFormTitle: document.querySelector('#scheduleFormTitle'),
  scheduleTitleInput: document.querySelector('#scheduleTitleInput'),
  scheduleTimeInput: document.querySelector('#scheduleTimeInput'),
  scheduleAdvanceInput: document.querySelector('#scheduleAdvanceInput'),
  cycleChoices: [...document.querySelectorAll('.cycle-choice')],
  cycleDescription: document.querySelector('#cycleDescription'),
  weekdayOptions: document.querySelector('#weekdayOptions'),
  weekdayChoices: [...document.querySelectorAll('.weekday-choice')],
  monthlyOption: document.querySelector('#monthlyOption'),
  scheduleDayInput: document.querySelector('#scheduleDayInput'),
  intervalOption: document.querySelector('#intervalOption'),
  scheduleIntervalInput: document.querySelector('#scheduleIntervalInput'),
  schedulePreview: document.querySelector('#schedulePreview'),
  scheduleNotesInput: document.querySelector('#scheduleNotesInput'),
  cancelScheduleEdit: document.querySelector('#cancelScheduleEdit'),
  scheduledList: document.querySelector('#scheduledList'),
  scheduleListCount: document.querySelector('#scheduleListCount'),
  scheduleEmptyState: document.querySelector('#scheduleEmptyState'),
  taskForm: document.querySelector('#taskForm'),
  titleInput: document.querySelector('#titleInput'),
  reminderInput: document.querySelector('#reminderInput'),
  priorityInput: document.querySelector('#priorityInput'),
  notesInput: document.querySelector('#notesInput'),
  submitTask: document.querySelector('#submitTask'),
  cancelEdit: document.querySelector('#cancelEdit'),
  taskList: document.querySelector('#taskList'),
  emptyState: document.querySelector('#emptyState'),
  searchInput: document.querySelector('#searchInput'),
  nextReminder: document.querySelector('#nextReminder'),
  clearCompleted: document.querySelector('#clearCompleted'),
  newTaskButton: document.querySelector('#newTaskButton'),
  autoStart: document.querySelector('#autoStart'),
  minimizeToTray: document.querySelector('#minimizeToTray'),
  alwaysOnTop: document.querySelector('#alwaysOnTop'),
  openDataFolder: document.querySelector('#openDataFolder'),
  openSettings: document.querySelector('#openSettings'),
  settingsModal: document.querySelector('#settingsModal'),
  closeSettings: document.querySelector('#closeSettings'),
  languageInput: document.querySelector('#languageInput'),
  postponeModal: document.querySelector('#postponeModal'),
  postponeForm: document.querySelector('#postponeForm'),
  postponeInput: document.querySelector('#postponeInput'),
  closePostpone: document.querySelector('#closePostpone'),
  cancelPostpone: document.querySelector('#cancelPostpone'),
  compactButton: document.querySelector('#compactButton'),
  compactShell: document.querySelector('#compactShell'),
  compactSummary: document.querySelector('#compactSummary'),
  compactTaskList: document.querySelector('#compactTaskList'),
  compactEmptyState: document.querySelector('#compactEmptyState'),
  compactPin: document.querySelector('#compactPin'),
  compactExpand: document.querySelector('#compactExpand'),
  compactClose: document.querySelector('#compactClose'),
  compactAddTask: document.querySelector('#compactAddTask'),
  compactAddFooter: document.querySelector('#compactAddFooter'),
  alarmShell: document.querySelector('#alarmShell'),
  alarmTitle: document.querySelector('#alarmTitle'),
  alarmNotes: document.querySelector('#alarmNotes'),
  alarmTime: document.querySelector('#alarmTime'),
  alarmDismiss: document.querySelector('#alarmDismiss'),
  alarmComplete: document.querySelector('#alarmComplete'),
  alarmPostpone: document.querySelector('#alarmPostpone'),
  alarmEdit: document.querySelector('#alarmEdit')
};

init();

async function init() {
  const appState = await window.todoApi.getState();
  state.tasks = appState.tasks || [];
  state.scheduledTasks = appState.scheduledTasks || [];
  state.settings = appState.settings || {};
  state.filter = state.settings.lastFilter || 'active';
  els.languageInput.value = state.settings.language || 'zh';
  applyLanguage();
  document.body.classList.toggle('compact-mode', state.mode === 'compact');
  document.body.classList.toggle('alarm-mode', state.mode === 'alarm');
  if (els.autoStart) els.autoStart.checked = Boolean(state.settings.autoStart);
  if (els.minimizeToTray) els.minimizeToTray.checked = state.settings.minimizeToTray !== false;
  if (els.alwaysOnTop) els.alwaysOnTop.checked = Boolean(state.settings.alwaysOnTop);
  bindEvents();
  render();
  if (state.mode !== 'alarm') {
    window.setInterval(() => render(), 60000);
  }
}

function bindEvents() {
  bindModalEvents();

  if (state.mode === 'alarm') {
    bindAlarmEvents();
    bindSharedEvents();
    return;
  }

  if (state.mode === 'compact') {
    bindCompactEvents();
    bindSharedEvents();
    return;
  }

  els.taskForm.addEventListener('submit', saveTask);
  els.cancelEdit.addEventListener('click', resetForm);
  els.newTaskButton.addEventListener('click', () => focusForm());
  els.scheduledTasksButton.addEventListener('click', () => {
    state.view = 'schedules';
    render();
    els.scheduleTitleInput.focus();
  });
  els.compactButton.addEventListener('click', () => window.todoApi.openCompact());
  els.clearCompleted.addEventListener('click', async () => {
    await window.todoApi.clearCompleted();
    resetForm();
  });
  els.searchInput.addEventListener('input', (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderList();
  });
  els.filters.forEach((button) => {
    button.addEventListener('click', async () => {
      state.view = 'tasks';
      state.filter = button.dataset.filter;
      await window.todoApi.updateSettings({ lastFilter: state.filter });
      render();
    });
  });
  els.scheduleForm.addEventListener('submit', saveScheduledTask);
  els.cancelScheduleEdit.addEventListener('click', resetScheduleForm);
  els.scheduleTimeInput.addEventListener('input', renderScheduleFormState);
  els.scheduleAdvanceInput.addEventListener('change', renderScheduleFormState);
  els.scheduleDayInput.addEventListener('change', renderScheduleFormState);
  els.scheduleIntervalInput.addEventListener('input', renderScheduleFormState);
  els.cycleChoices.forEach((button) => {
    button.addEventListener('click', () => {
      state.scheduleCycle = button.dataset.cycle;
      if (state.scheduleCycle === 'weekly' && !selectedWeekdays().length) setSelectedWeekdays([1]);
      if (state.scheduleCycle === 'custom' && !selectedWeekdays().length) setSelectedWeekdays([1, 2, 3, 4, 5]);
      renderScheduleFormState();
    });
  });
  els.weekdayChoices.forEach((button) => {
    button.addEventListener('click', () => {
      const day = Number(button.dataset.weekday);
      if (state.scheduleCycle === 'weekly') {
        setSelectedWeekdays([day]);
      } else {
        const selected = selectedWeekdays();
        setSelectedWeekdays(selected.includes(day) ? selected.filter((item) => item !== day) : [...selected, day]);
      }
      renderScheduleFormState();
    });
  });
  els.autoStart.addEventListener('change', () => window.todoApi.updateSettings({ autoStart: els.autoStart.checked }));
  els.minimizeToTray.addEventListener('change', () => window.todoApi.updateSettings({ minimizeToTray: els.minimizeToTray.checked }));
  els.alwaysOnTop.addEventListener('change', () => window.todoApi.setAlwaysOnTop(els.alwaysOnTop.checked));
  els.openDataFolder.addEventListener('click', () => window.todoApi.openDataFolder());
  els.openSettings.addEventListener('click', openSettings);
  els.closeSettings.addEventListener('click', closeSettings);
  els.settingsModal.addEventListener('click', (event) => {
    if (event.target === els.settingsModal) closeSettings();
  });
  els.languageInput.addEventListener('change', async () => {
    state.settings = await window.todoApi.updateSettings({ language: els.languageInput.value });
    applyLanguage();
    render();
  });

  bindSharedEvents();
}

function bindModalEvents() {
  els.closePostpone.addEventListener('click', closePostpone);
  els.cancelPostpone.addEventListener('click', closePostpone);
  els.postponeModal.addEventListener('click', (event) => {
    if (event.target === els.postponeModal) closePostpone();
  });
  els.postponeForm.addEventListener('submit', submitPostpone);
}

function bindSharedEvents() {
  window.todoApi.onTasksUpdated((tasks) => {
    state.tasks = tasks;
    render();
  });
  window.todoApi.onScheduledTasksUpdated((tasks) => {
    state.scheduledTasks = tasks;
    render();
  });
  window.todoApi.onSettingsUpdated((settings) => {
    state.settings = settings || {};
    if (els.languageInput) els.languageInput.value = state.settings.language || 'zh';
    applyLanguage();
    render();
  });
  window.todoApi.onFocusNewTask(() => focusForm());
  window.todoApi.onSelectTask((id) => {
    state.view = 'tasks';
    state.filter = 'all';
    render();
    setTimeout(() => document.querySelector(`[data-task-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  });
  window.todoApi.onSelectSchedule((id) => {
    state.view = 'schedules';
    render();
    setTimeout(() => document.querySelector(`[data-schedule-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  });
  window.todoApi.onEditTask((id) => editTaskLocally(id));
}

function bindCompactEvents() {
  els.compactPin.addEventListener('click', async () => {
    state.settings.alwaysOnTop = !state.settings.alwaysOnTop;
    await window.todoApi.setAlwaysOnTop(state.settings.alwaysOnTop);
    renderCompactPin();
  });
  els.compactExpand.addEventListener('click', () => window.todoApi.showMain());
  els.compactClose.addEventListener('click', () => window.todoApi.hideCompact());
  els.compactAddTask.addEventListener('click', () => window.todoApi.editTask());
  els.compactAddFooter.addEventListener('click', () => window.todoApi.editTask());
}

function bindAlarmEvents() {
  els.alarmDismiss.addEventListener('click', () => window.todoApi.closeCurrentWindow());
  els.alarmComplete.addEventListener('click', async () => {
    if (state.alarmScheduleId) return;
    await window.todoApi.updateTask(state.alarmTaskId, { completed: true });
    await window.todoApi.closeCurrentWindow();
  });
  els.alarmPostpone.addEventListener('click', async () => {
    if (state.alarmScheduleId) return;
    openPostpone(state.alarmTaskId);
  });
  els.alarmEdit.addEventListener('click', () => {
    if (state.alarmScheduleId) return;
    window.todoApi.editTask(state.alarmTaskId);
  });
}

async function saveTask(event) {
  event.preventDefault();
  const payload = {
    title: els.titleInput.value,
    notes: els.notesInput.value,
    priority: els.priorityInput.value,
    reminderAt: localInputToIso(els.reminderInput.value)
  };

  if (state.editingId) {
    await window.todoApi.updateTask(state.editingId, payload);
  } else {
    await window.todoApi.createTask(payload);
  }
  resetForm();
}

async function saveScheduledTask(event) {
  event.preventDefault();
  const scheduleType = state.scheduleCycle;
  const weekdays = selectedWeekdays();
  if ((scheduleType === 'weekly' || scheduleType === 'custom') && !weekdays.length) {
    els.cycleDescription.textContent = t('weekdayHint');
    els.cycleDescription.classList.add('validation-hint');
    return;
  }
  els.cycleDescription.classList.remove('validation-hint');

  const payload = {
    title: els.scheduleTitleInput.value,
    notes: els.scheduleNotesInput.value,
    time: els.scheduleTimeInput.value,
    advanceMinutes: Number(els.scheduleAdvanceInput.value),
    scheduleType,
    weekdays,
    dayOfMonth: Number(els.scheduleDayInput.value),
    intervalDays: Number(els.scheduleIntervalInput.value),
    enabled: true
  };

  if (state.editingScheduleId) {
    await window.todoApi.updateScheduledTask(state.editingScheduleId, payload);
  } else {
    await window.todoApi.createScheduledTask(payload);
  }
  resetScheduleForm();
}

function resetForm() {
  state.editingId = null;
  els.taskForm.reset();
  els.priorityInput.value = 'medium';
  els.submitTask.textContent = t('saveTask');
  els.cancelEdit.classList.add('hidden');
  els.taskForm.classList.add('hidden');
}

function resetScheduleForm() {
  state.editingScheduleId = null;
  state.scheduleCycle = 'daily';
  els.scheduleForm.reset();
  els.scheduleTimeInput.value = '09:00';
  els.scheduleAdvanceInput.value = '15';
  els.scheduleDayInput.value = '1';
  els.scheduleIntervalInput.value = '2';
  setSelectedWeekdays([1, 2, 3, 4, 5]);
  els.scheduleFormTitle.textContent = t('createSchedule');
  els.cancelScheduleEdit.classList.add('hidden');
  renderScheduleFormState();
}

function editScheduledTask(id) {
  const schedule = state.scheduledTasks.find((item) => item.id === id);
  if (!schedule) return;
  state.editingScheduleId = id;
  state.scheduleCycle = schedule.scheduleType || 'daily';
  els.scheduleTitleInput.value = schedule.title;
  els.scheduleNotesInput.value = schedule.notes || '';
  els.scheduleTimeInput.value = schedule.time || '09:00';
  els.scheduleAdvanceInput.value = String(schedule.advanceMinutes ?? 15);
  els.scheduleDayInput.value = String(schedule.dayOfMonth || 1);
  els.scheduleIntervalInput.value = String(schedule.intervalDays || 2);
  setSelectedWeekdays(schedule.weekdays || []);
  els.scheduleFormTitle.textContent = t('editSchedule');
  els.cancelScheduleEdit.classList.remove('hidden');
  renderScheduleFormState();
  els.scheduleTitleInput.focus();
  els.scheduleTitleInput.select();
}

function selectedWeekdays() {
  return els.weekdayChoices
    .filter((button) => button.classList.contains('active'))
    .map((button) => Number(button.dataset.weekday));
}

function setSelectedWeekdays(days) {
  const selected = new Set(days.map(Number));
  els.weekdayChoices.forEach((button) => button.classList.toggle('active', selected.has(Number(button.dataset.weekday))));
}

function scheduleDraft() {
  return {
    scheduleType: state.scheduleCycle,
    time: els.scheduleTimeInput.value || '09:00',
    weekdays: selectedWeekdays(),
    dayOfMonth: Number(els.scheduleDayInput.value) || 1,
    intervalDays: Number(els.scheduleIntervalInput.value) || 1,
    anchorAt: new Date().toISOString()
  };
}

function makeScheduleDate(year, month, day, hour, minute) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(Math.max(day, 1), lastDay), hour, minute, 0, 0);
}

function nextScheduleOccurrence(schedule, afterMs = Date.now()) {
  const [hourValue, minuteValue] = String(schedule.time || '09:00').split(':').map(Number);
  const hour = Number.isInteger(hourValue) ? Math.min(Math.max(hourValue, 0), 23) : 9;
  const minute = Number.isInteger(minuteValue) ? Math.min(Math.max(minuteValue, 0), 59) : 0;
  const after = new Date(afterMs);
  const type = schedule.scheduleType || 'daily';

  if (type === 'monthly') {
    for (let offset = 0; offset < 24; offset += 1) {
      const candidate = makeScheduleDate(after.getFullYear(), after.getMonth() + offset, Number(schedule.dayOfMonth) || 1, hour, minute);
      if (candidate.getTime() > afterMs) return candidate;
    }
  }

  if (type === 'interval') {
    const interval = Math.max(1, Number(schedule.intervalDays) || 1);
    const anchor = new Date(schedule.anchorAt || afterMs);
    let candidate = makeScheduleDate(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), hour, minute);
    while (candidate.getTime() <= afterMs) candidate.setDate(candidate.getDate() + interval);
    return candidate;
  }

  const weekdays = type === 'weekdays'
    ? [1, 2, 3, 4, 5]
    : type === 'weekly'
      ? [Number(schedule.weekdays?.[0] ?? 1)]
      : type === 'custom'
        ? (schedule.weekdays?.length ? schedule.weekdays.map(Number) : [1])
        : null;

  for (let offset = 0; offset < 370; offset += 1) {
    const date = new Date(after.getFullYear(), after.getMonth(), after.getDate() + offset);
    if (weekdays && !weekdays.includes(date.getDay())) continue;
    const candidate = makeScheduleDate(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute);
    if (candidate.getTime() > afterMs) return candidate;
  }
  return new Date(afterMs + 24 * 60 * 60 * 1000);
}

function renderScheduleFormState() {
  els.cycleChoices.forEach((button) => button.classList.toggle('active', button.dataset.cycle === state.scheduleCycle));
  const needsWeekdays = state.scheduleCycle === 'weekly' || state.scheduleCycle === 'custom';
  els.weekdayOptions.classList.toggle('hidden', !needsWeekdays);
  els.monthlyOption.classList.toggle('hidden', state.scheduleCycle !== 'monthly');
  els.intervalOption.classList.toggle('hidden', state.scheduleCycle !== 'interval');
  const hintKey = `cycle${state.scheduleCycle[0].toUpperCase()}${state.scheduleCycle.slice(1)}Hint`;
  els.cycleDescription.textContent = t(hintKey);
  els.cycleDescription.classList.remove('validation-hint');
  const preview = nextScheduleOccurrence(scheduleDraft());
  els.schedulePreview.textContent = formatDateTime(preview);
}

function renderScheduledView() {
  els.scheduledCount.textContent = state.scheduledTasks.length;
  els.scheduleActiveCount.textContent = state.scheduledTasks.filter((schedule) => schedule.enabled).length;
  els.scheduleListCount.textContent = state.scheduledTasks.length;
  renderScheduleFormState();
  const schedules = [...state.scheduledTasks].sort((a, b) => {
    if (a.enabled !== b.enabled) return Number(b.enabled) - Number(a.enabled);
    return new Date(a.nextRunAt || 0) - new Date(b.nextRunAt || 0);
  });
  els.scheduledList.innerHTML = schedules.map(scheduledTaskTemplate).join('');
  els.scheduledList.classList.toggle('hidden', schedules.length === 0);
  els.scheduleEmptyState.classList.toggle('hidden', schedules.length > 0);

  els.scheduledList.querySelectorAll('[data-action="toggle-schedule"]').forEach((input) => {
    input.addEventListener('change', () => window.todoApi.updateScheduledTask(input.dataset.id, { enabled: input.checked }));
  });
  els.scheduledList.querySelectorAll('[data-action="edit-schedule"]').forEach((button) => {
    button.addEventListener('click', () => editScheduledTask(button.dataset.id));
  });
  els.scheduledList.querySelectorAll('[data-action="delete-schedule"]').forEach((button) => {
    button.addEventListener('click', () => window.todoApi.deleteScheduledTask(button.dataset.id));
  });
}

function scheduledTaskTemplate(schedule) {
  const next = schedule.nextRunAt && schedule.enabled ? t('scheduleNext', { time: formatDateTime(schedule.nextRunAt) }) : t('schedulePaused');
  const advance = Number(schedule.advanceMinutes) ? `<span class="schedule-meta-pill">${escapeHtml(t('scheduleAdvance', { time: formatScheduleAdvance(schedule.advanceMinutes) }))}</span>` : '';
  const notes = schedule.notes ? `<p class="schedule-notes">${escapeHtml(schedule.notes)}</p>` : '';
  return `
    <article class="scheduled-card ${schedule.enabled ? '' : 'paused'}" data-schedule-id="${schedule.id}">
      <label class="schedule-switch" title="${escapeHtml(schedule.enabled ? t('scheduleEnabled') : t('schedulePaused'))}">
        <input data-action="toggle-schedule" data-id="${schedule.id}" type="checkbox" ${schedule.enabled ? 'checked' : ''} />
        <span></span>
      </label>
      <div class="scheduled-card-body">
        <div class="scheduled-card-title">
          <h3>${escapeHtml(schedule.title)}</h3>
          <span class="schedule-status">${escapeHtml(schedule.enabled ? t('scheduleEnabled') : t('schedulePaused'))}</span>
        </div>
        ${notes}
        <div class="schedule-meta">
          <span class="schedule-meta-pill">${escapeHtml(scheduleCycleLabel(schedule))}</span>
          <span class="schedule-meta-pill">${escapeHtml(next)}</span>
          ${advance}
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-button" data-action="edit-schedule" data-id="${schedule.id}" type="button" title="${t('edit')}">✎</button>
        <button class="icon-button delete" data-action="delete-schedule" data-id="${schedule.id}" type="button" title="${t('delete')}">×</button>
      </div>
    </article>
  `;
}

function scheduleCycleLabel(schedule) {
  const type = schedule.scheduleType || 'daily';
  if (type === 'daily') return t('scheduleEveryDay');
  if (type === 'weekdays') return t('scheduleEveryWeekday');
  if (type === 'monthly') return t('scheduleEveryMonth', { day: schedule.dayOfMonth || 1 });
  if (type === 'interval') return t('scheduleEveryInterval', { days: schedule.intervalDays || 1 });
  const names = (schedule.weekdays || [1]).slice().sort((a, b) => a - b).map(weekdayLabel).join(currentLanguage() === 'en' ? ', ' : '、');
  return t(type === 'weekly' ? 'scheduleEveryWeek' : 'scheduleCustomDays', { days: names });
}

function weekdayLabel(day) {
  const names = currentLanguage() === 'en'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['日', '一', '二', '三', '四', '五', '六'];
  return names[Number(day)] || names[1];
}

function formatScheduleAdvance(minutes) {
  const value = Number(minutes) || 0;
  if (value >= 1440) return currentLanguage() === 'en' ? '1 day' : '1天';
  if (value >= 60) return currentLanguage() === 'en' ? `${value / 60} hours` : `${value / 60}小时`;
  return currentLanguage() === 'en' ? `${value} minutes` : `${value}分钟`;
}

function focusForm(task) {
  if (state.mode === 'compact' || state.mode === 'alarm') {
    window.todoApi.editTask(task?.id);
    return;
  }

  if (task) {
    state.editingId = task.id;
    els.titleInput.value = task.title;
    els.notesInput.value = task.notes || '';
    els.priorityInput.value = task.priority || 'medium';
    els.reminderInput.value = isoToLocalInput(task.reminderAt);
    els.submitTask.textContent = t('updateTask');
    els.cancelEdit.classList.remove('hidden');
  } else {
    resetForm();
    els.taskForm.classList.remove('hidden');
    els.cancelEdit.classList.remove('hidden');
  }
  els.taskForm.classList.remove('hidden');
  els.titleInput.focus();
  els.titleInput.select();
}

function render() {
  if (state.mode === 'compact') {
    renderCompact();
    return;
  }
  if (state.mode === 'alarm') {
    renderAlarm();
    return;
  }

  const scheduleMode = state.view === 'schedules';
  document.querySelector('.workspace').classList.toggle('schedule-view-mode', scheduleMode);
  els.mainTopbar.classList.toggle('hidden', scheduleMode);
  els.taskWorkspaceView.classList.toggle('hidden', scheduleMode);
  els.scheduleView.classList.toggle('hidden', !scheduleMode);
  els.scheduledTasksButton.classList.toggle('active', scheduleMode);
  if (scheduleMode) {
    renderScheduledView();
    return;
  }

  els.viewTitle.textContent = t(labels[state.filter]);
  els.filters.forEach((button) => button.classList.toggle('active', button.dataset.filter === state.filter));
  renderCounts();
  renderNextReminder();
  renderList();
}

function renderAlarm() {
  if (state.alarmScheduleId) {
    const schedule = state.scheduledTasks.find((item) => item.id === state.alarmScheduleId);
    if (!schedule) {
      window.todoApi.closeCurrentWindow();
      return;
    }
    const isDue = state.alarmOffset === 'due';
    els.alarmTitle.textContent = schedule.title;
    els.alarmNotes.textContent = isDue
      ? t('scheduleAlarmDue')
      : t('scheduleAlarmAdvance', { time: formatScheduleAdvance(schedule.advanceMinutes) });
    els.alarmTime.textContent = schedule.nextRunAt
      ? t('reminderTimeLabel', { time: formatDateTime(schedule.nextRunAt) })
      : '';
    els.alarmComplete.classList.add('hidden');
    els.alarmPostpone.classList.add('hidden');
    els.alarmEdit.classList.add('hidden');
    return;
  }

  const task = state.tasks.find((item) => item.id === state.alarmTaskId);
  if (!task) {
    window.todoApi.closeCurrentWindow();
    return;
  }
  els.alarmTitle.textContent = task.title;
  const isDue = state.alarmOffset === 'due';
  const offset = state.alarmOffset && !isDue ? reminderOffsetLabel(state.alarmOffset) : '';
  const reminderText = isDue || !state.alarmOffset ? t('reminderTimeReached') : t('deadlineReminder', { time: offset });
  els.alarmNotes.textContent = [reminderText, task.notes].filter(Boolean).join('\n');
  els.alarmTime.textContent = task.reminderAt ? t('reminderTimeLabel', { time: formatDateTime(task.reminderAt) }) : t('reminderTimeReached');
  els.alarmComplete.classList.remove('hidden');
  els.alarmPostpone.classList.remove('hidden');
  els.alarmEdit.classList.remove('hidden');
  els.alarmPostpone.classList.remove('hidden');
}

function editTaskLocally(id) {
  if (state.mode !== 'main') return;
  state.filter = 'all';
  render();
  const task = state.tasks.find((item) => item.id === id);
  if (task) focusForm(task);
}

function renderCounts() {
  const overdueTasks = state.tasks.filter((task) => isOverdueTask(task));
  const todayTasks = state.tasks.filter((task) => !task.completed && !isOverdueTask(task) && isToday(task.reminderAt));
  els.overdueCount.textContent = overdueTasks.length;
  els.activeCount.textContent = state.tasks.filter((task) => !task.completed && !isOverdueTask(task)).length;
  els.todayCount.textContent = todayTasks.length;
  els.allCount.textContent = state.tasks.length;
  els.doneCount.textContent = state.tasks.filter((task) => task.completed).length;
  els.scheduledCount.textContent = state.scheduledTasks.length;
}

function activeTasks() {
  return state.tasks
    .filter((task) => !task.completed && !isOverdueTask(task))
    .sort(compareTasks);
}

function renderCompact() {
  const tasks = activeTasks();
  els.compactSummary.textContent = tasks.length ? t('pendingCount', { count: tasks.length }) : t('noPending');
  renderCompactPin();
  els.compactTaskList.innerHTML = tasks.slice(0, 8).map(compactTaskTemplate).join('');
  els.compactTaskList.classList.toggle('hidden', tasks.length === 0);
  els.compactEmptyState.classList.toggle('hidden', tasks.length > 0);

  els.compactTaskList.querySelectorAll('[data-action="complete-compact"]').forEach((button) => {
    button.addEventListener('click', () => window.todoApi.updateTask(button.dataset.id, { completed: true }));
  });
  els.compactTaskList.querySelectorAll('[data-action="start-compact"]').forEach((button) => {
    button.addEventListener('click', () => window.todoApi.startTask(button.dataset.id));
  });
  els.compactTaskList.querySelectorAll('[data-action="postpone-compact"]').forEach((button) => {
    button.addEventListener('click', () => openPostpone(button.dataset.id));
  });
  els.compactTaskList.querySelectorAll('[data-action="edit-compact"]').forEach((button) => {
    button.addEventListener('click', () => window.todoApi.editTask(button.dataset.id));
  });
}

function renderCompactPin() {
  els.compactPin.classList.toggle('active', Boolean(state.settings.alwaysOnTop));
  els.compactPin.textContent = state.settings.alwaysOnTop ? t('pinned') : t('pin');
}

function compactTaskTemplate(task) {
  const reminder = task.reminderAt ? `<span class="compact-time ${isOverdue(task.reminderAt) ? 'overdue' : ''}">${formatDateTime(task.reminderAt)}</span>` : `<span class="compact-time">${t('noReminderTime')}</span>`;
  const startAction = task.startedAt
    ? ''
    : `<button class="start-action" data-action="start-compact" data-id="${task.id}" type="button" title="${t('startTask')}">${t('startTask')}</button>`;
  const postponeAction = isOverdue(task.reminderAt)
    ? `<button data-action="postpone-compact" data-id="${task.id}" type="button" title="${t('postpone')}">${t('postpone')}</button>`
    : '';
  const completeAction = task.startedAt
    ? `<button data-action="complete-compact" data-id="${task.id}" type="button" title="${t('complete')}">${t('complete')}</button>`
    : '';
  return `
    <article class="compact-task ${task.priority}" data-task-id="${task.id}">
      <div class="compact-task-main">
        <h3>${escapeHtml(task.title)}</h3>
        <div class="compact-meta">${reminder}<span>${t(priorityLabels[task.priority] || 'priorityMedium')}</span><span>${elapsedLabel(task, true)}</span></div>
      </div>
      <div class="compact-task-actions no-drag">
        ${completeAction}
        ${startAction}
        ${postponeAction}
        <button data-action="edit-compact" data-id="${task.id}" type="button" title="${t('edit')}">${t('edit')}</button>
      </div>
    </article>
  `;
}

function renderNextReminder() {
  const next = state.tasks
    .flatMap((task) => pendingReminderEvents(task))
    .sort((a, b) => a.at - b.at)[0];
  els.nextReminder.textContent = next ? t('nextReminder', { time: formatDateTime(next.at), title: next.task.title }) : t('noReminders');
}

function renderList() {
  const tasks = filteredTasks();
  els.taskList.innerHTML = tasks.map(taskTemplate).join('');
  els.emptyState.classList.toggle('hidden', tasks.length > 0);
  els.taskList.classList.toggle('hidden', tasks.length === 0);

  els.taskList.querySelectorAll('[data-action="toggle"]').forEach((input) => {
    input.addEventListener('change', () => window.todoApi.updateTask(input.dataset.id, { completed: input.checked }));
  });
  els.taskList.querySelectorAll('[data-action="start"]').forEach((button) => {
    button.addEventListener('click', () => window.todoApi.startTask(button.dataset.id));
  });
  els.taskList.querySelectorAll('[data-action="complete"]').forEach((button) => {
    button.addEventListener('click', () => window.todoApi.updateTask(button.dataset.id, { completed: true }));
  });
  els.taskList.querySelectorAll('[data-action="edit"]').forEach((button) => {
    button.addEventListener('click', () => focusForm(state.tasks.find((task) => task.id === button.dataset.id)));
  });
  els.taskList.querySelectorAll('[data-action="delete"]').forEach((button) => {
    button.addEventListener('click', () => window.todoApi.deleteTask(button.dataset.id));
  });
  els.taskList.querySelectorAll('[data-action="postpone"]').forEach((button) => {
    button.addEventListener('click', () => openPostpone(button.dataset.id));
  });
}

function filteredTasks() {
  const query = state.search;
  return state.tasks
    .filter((task) => {
      if (state.filter === 'overdue') return isOverdueTask(task);
      if (state.filter === 'active') return !task.completed && !isOverdueTask(task);
      if (state.filter === 'completed') return task.completed;
      if (state.filter === 'today') return !task.completed && !isOverdueTask(task) && isToday(task.reminderAt);
      return true;
    })
    .filter((task) => !query || `${task.title} ${task.notes}`.toLowerCase().includes(query))
    .sort(compareTasks);
}

function taskTemplate(task) {
  const overdue = isOverdueTask(task);
  const dueClass = overdue ? ' due' : '';
  const notes = task.notes ? `<p class="task-notes">${escapeHtml(task.notes)}</p>` : '';
  const reminder = task.reminderAt ? `<span class="meta-pill${dueClass}">${escapeHtml(t('reminder', { time: formatDateTime(task.reminderAt) }))}</span>` : `<span class="meta-pill">${t('noReminder')}</span>`;
  const done = task.completed ? `<span class="meta-pill">${t('completedTag')}</span>` : '';
  const overdueTag = overdue ? `<span class="meta-pill overdue-tag">${t('overdue')}</span>` : '';
  const postponed = task.postponedCount ? `<span class="meta-pill">${t('postponed', { count: task.postponedCount })}</span>` : '';
  const started = task.startedAt ? `<span class="meta-pill">${t('startedAt', { time: formatDateTime(task.startedAt) })}</span>` : `<span class="meta-pill not-started">${t('notStarted')}</span>`;
  const elapsed = `<span class="meta-pill">${elapsedLabel(task)}</span>`;
  const startAction = !task.completed && !task.startedAt
    ? `<button class="start-button" data-action="start" data-id="${task.id}" type="button" title="${t('startTask')}">${t('startTask')}</button>`
    : '';
  const completeAction = !task.completed && task.startedAt
    ? `<button class="complete-button" data-action="complete" data-id="${task.id}" type="button" title="${t('complete')}">${t('complete')}</button>`
    : '';
  const postponeAction = !task.completed && isOverdue(task.reminderAt)
    ? `<button class="icon-button postpone" data-action="postpone" data-id="${task.id}" type="button" title="${t('postpone')}">⏱</button>`
    : '';

  return `
    <article class="task-card ${task.completed ? 'completed' : ''}${overdue ? ' overdue' : ''}" data-task-id="${task.id}">
      <input class="complete-toggle" data-action="toggle" data-id="${task.id}" type="checkbox" ${task.completed ? 'checked' : ''} aria-label="${t('toggleComplete')}" />
      <div class="task-body">
        <div class="task-title-row">
          <h3 class="task-title">${escapeHtml(task.title)}</h3>
          <span class="priority ${task.priority}">${t(priorityLabels[task.priority] || 'priorityMedium')}</span>
        </div>
        ${notes}
        <div class="task-meta">${reminder}${overdueTag}${done}${postponed}${started}${elapsed}<span class="meta-pill">${t('created', { date: formatShort(task.createdAt) })}</span></div>
      </div>
      <div class="task-actions">
        ${completeAction}
        ${startAction}
        ${postponeAction}
        <button class="icon-button" data-action="edit" data-id="${task.id}" type="button" title="${t('edit')}">✎</button>
        <button class="icon-button delete" data-action="delete" data-id="${task.id}" type="button" title="${t('delete')}">×</button>
      </div>
    </article>
  `;
}

function localInputToIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isoToLocalInput(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat(currentLanguage() === 'en' ? 'en-US' : 'zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function formatShort(value) {
  return new Intl.DateTimeFormat(currentLanguage() === 'en' ? 'en-US' : 'zh-CN', {
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(value));
}

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

function isOverdue(value) {
  return value && new Date(value).getTime() < Date.now();
}

function isOverdueTask(task) {
  return !task.completed && isOverdue(task.reminderAt);
}

function compareTasks(a, b) {
  const overdueScore = Number(isOverdueTask(b)) - Number(isOverdueTask(a));
  if (overdueScore) return overdueScore;
  if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
  const priorityScore = { high: 0, medium: 1, low: 2 };
  const reminderA = a.reminderAt ? new Date(a.reminderAt).getTime() : Infinity;
  const reminderB = b.reminderAt ? new Date(b.reminderAt).getTime() : Infinity;
  return reminderA - reminderB || priorityScore[a.priority] - priorityScore[b.priority] || new Date(b.createdAt) - new Date(a.createdAt);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

function currentLanguage() {
  return state.settings.language === 'en' ? 'en' : 'zh';
}

function t(key, replacements = {}) {
  let value = translations[currentLanguage()][key] || translations.zh[key] || key;
  Object.entries(replacements).forEach(([name, replacement]) => {
    value = value.replace(`{${name}}`, String(replacement));
  });
  return value;
}

function applyLanguage() {
  const language = currentLanguage();
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
  document.title = t('appName');
  els.todayLabel.textContent = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(new Date());
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    element.title = t(element.dataset.i18nTitle);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
  });
}

function openSettings() {
  els.settingsModal.classList.remove('hidden');
  els.languageInput.focus();
}

function closeSettings() {
  els.settingsModal.classList.add('hidden');
}

function openPostpone(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task || task.completed) return;
  state.postponingId = id;
  const reminderTime = task.reminderAt ? new Date(task.reminderAt).getTime() : 0;
  const defaultTime = reminderTime > Date.now() ? task.reminderAt : new Date(Date.now() + 30 * 60000).toISOString();
  els.postponeInput.value = isoToLocalInput(defaultTime);
  els.postponeInput.setCustomValidity('');
  els.postponeModal.classList.remove('hidden');
  els.postponeInput.focus();
  els.postponeInput.select();
}

function closePostpone() {
  state.postponingId = null;
  els.postponeModal.classList.add('hidden');
  els.postponeForm.reset();
}

async function submitPostpone(event) {
  event.preventDefault();
  if (!state.postponingId) return;
  const reminderAt = localInputToIso(els.postponeInput.value);
  if (!reminderAt || new Date(reminderAt).getTime() <= Date.now()) {
    els.postponeInput.setCustomValidity(t('futureTime'));
    els.postponeInput.reportValidity();
    return;
  }
  els.postponeInput.setCustomValidity('');
  await window.todoApi.postponeTask(state.postponingId, reminderAt);
  const closeAlarm = state.mode === 'alarm';
  closePostpone();
  if (closeAlarm) await window.todoApi.closeCurrentWindow();
}

function elapsedHours(task) {
  if (!task.startedAt) return 0;
  const start = new Date(task.startedAt).getTime();
  if (Number.isNaN(start)) return 0;
  const end = task.completed ? new Date(task.completedAt || task.updatedAt || Date.now()).getTime() : Date.now();
  return Math.max(0, (end - start) / 3600000);
}

function elapsedLabel(task, compact = false) {
  if (!task.startedAt) return t('notStarted');
  return t(compact ? 'elapsedShort' : 'elapsed', { hours: formatHours(elapsedHours(task)) });
}

function formatHours(hours) {
  return hours < 10 ? hours.toFixed(1) : Math.round(hours).toString();
}

function reminderOffsetLabel(key) {
  if (key === 'due') return '';
  if (key === '0.5') return currentLanguage() === 'en' ? '30 minutes' : '30分钟';
  return currentLanguage() === 'en' ? `${key} hours` : `${key}小时`;
}

function pendingReminderEvents(task, now = Date.now()) {
  if (task.completed || !task.reminderAt) return [];
  const deadline = new Date(task.reminderAt).getTime();
  if (Number.isNaN(deadline)) return [];
  const scheduleStart = new Date(task.reminderBaseAt || Date.now()).getTime();
  const notified = new Set(Array.isArray(task.reminderNotifiedOffsets) ? task.reminderNotifiedOffsets.map(String) : []);
  return reminderRules
    .map((rule) => ({ task, rule, at: deadline - rule.milliseconds }))
    .filter((event) => !notified.has(event.rule.key) && event.at >= scheduleStart && event.at > now)
    .sort((a, b) => a.at - b.at);
}
