const STORAGE_KEY = 'metanav-organizator-v1';
const tips = [
  'La claridad empieza por escribir el siguiente paso.',
  'Protege tu atención: una misión a la vez.',
  'Un plan pequeño que se cumple vence al plan perfecto.',
  'Cierra el día dejando una pista para tu yo de mañana.'
];
const statusLabels = { todo: 'Por hacer', doing: 'En progreso', done: 'Hecho' };
const priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };
const initialState = {
  tasks: [], focusSessions: 0, selectedTheme: 'vibrant', productivityMethods: ['pomodoro', 'kanban'], pomodoroMinutes: 25,
  reflection: 'Aprendi que trabajo mejor cuando convierto una tarea grande en pasos visibles. Al ordenar mis prioridades y reservar bloques de foco, dejo de reaccionar a todo al mismo tiempo. A futuro quiero revisar mi plan al final de cada jornada y ajustar mi ritmo sin perder de vista lo importante.',
  focus: { status: 'stopped', remaining: 1500, startedAt: null, duration: 1500 }, createdAt: Date.now()
};
let state = loadState();
let currentRoute = getRoute();
let calendarDate = new Date();
let timerInterval;

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored ? { ...initialState, ...stored, focus: { ...initialState.focus, ...stored.focus } } : structuredClone(initialState);
  } catch { return structuredClone(initialState); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function dispatch(action) {
  action(); saveState(); render();
}
function getRoute() { return location.hash.replace('#', '') || 'dashboard'; }
function esc(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char])); }
function formatDate(date) { return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`)); }
function formatTime(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.max(0, seconds % 60)).padStart(2, '0')}`; }
function todayKey() { return new Date().toISOString().slice(0, 10); }
function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('visible'); setTimeout(() => toast.classList.remove('visible'), 2400); }

function render() {
  currentRoute = getRoute();
  if (!['dashboard', 'tasks', 'calendar', 'focus', 'stats', 'settings'].includes(currentRoute)) currentRoute = 'dashboard';
  document.body.dataset.theme = state.selectedTheme === 'drab' ? 'drab' : 'vibrant';
  document.querySelectorAll('#main-nav a').forEach(link => link.classList.toggle('active', link.dataset.route === currentRoute));
  document.querySelector('#date-stamp').textContent = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date());
  document.querySelector('#footer-tip').textContent = tips[new Date().getDate() % tips.length];
  document.querySelector('#app').innerHTML = screens[currentRoute]();
  bindEvents();
  if (currentRoute === 'focus') startTimerLoop();
}

function heading(title, copy, action = '') { return `<div class="page-heading"><div><div class="section-kicker">METANAV / ${currentRoute.toUpperCase()}</div><h1>${title}</h1><p class="heading-copy">${copy}</p></div>${action}</div>`; }
function metric(label, value) { return `<article class="metric"><span class="metric-label">${label}</span><strong class="metric-value">${value}</strong></article>`; }
function taskRows(tasks) { return tasks.length ? tasks.map(task => `<div class="task-row"><span class="task-stripe"></span><div><p>${esc(task.title)}</p><span class="task-meta">${task.dueDate ? formatDate(task.dueDate) : 'Sin fecha'} / ${statusLabels[task.status]}</span></div><span class="priority ${task.priority}">${priorityLabels[task.priority]}</span></div>`).join('') : '<div class="empty-state">No hay misiones todavía. Crea la primera y dale una dirección a tu día.</div>'; }
function dashboard() {
  const completed = state.tasks.filter(task => task.status === 'done').length; const pending = state.tasks.filter(task => task.status !== 'done').length; const percent = state.tasks.length ? Math.round(completed / state.tasks.length * 100) : 0;
  return heading('Tu tablero.', 'Un mapa breve de lo que importa hoy. Elige una misión, avanza con intención.', '<a class="button" href="#tasks">+ Nueva misión</a>') + `<section class="metric-grid">${metric('Pendientes', pending)}${metric('Completadas', completed)}${metric('Rendimiento', `${percent}%`)}${metric('Sesiones foco', state.focusSessions)}</section><div class="dashboard-grid"><section class="panel"><div class="panel-header"><h2>Actividad reciente</h2><a class="text-link" href="#tasks">Ver tablero →</a></div>${taskRows(state.tasks.slice(-5).reverse())}</section><section class="panel tip-panel"><div class="eyebrow">SEÑAL DEL DÍA</div><h2>Consejo táctico</h2><p>${tips[new Date().getDate() % tips.length]}</p><a class="button secondary" href="#focus">Entrar en foco</a></section></div><section class="reflection"><h2>Nota para el camino</h2><p>${esc(state.reflection)}</p></section>`;
}
function taskCard(task) { return `<article class="task-card"><span class="priority ${task.priority}">${priorityLabels[task.priority]}</span><p>${esc(task.title)}</p><small>${task.dueDate ? `Fecha: ${formatDate(task.dueDate)}` : 'Sin fecha límite'}</small><div class="task-card-actions"><select class="select-mini status-select" data-id="${task.id}" aria-label="Cambiar estado de ${esc(task.title)}">${Object.entries(statusLabels).map(([key, label]) => `<option value="${key}" ${task.status === key ? 'selected' : ''}>${label}</option>`).join('')}</select><button class="delete-task" data-delete="${task.id}" type="button" aria-label="Eliminar ${esc(task.title)}">Eliminar</button></div></article>`; }
function tasks() { return heading('Mis tareas.', 'Convierte el ruido en un tablero claro. Cada tarjeta es un paso que puedes mover.', '') + `<section class="panel form-panel"><form id="task-form" class="task-form"><div class="field"><label for="task-title">Nueva misión</label><input id="task-title" name="title" placeholder="Ej. Crear flujo de onboarding" required></div><div class="field"><label for="task-priority">Prioridad</label><select id="task-priority" name="priority"><option value="high">Alta</option><option value="medium" selected>Media</option><option value="low">Baja</option></select></div><div class="field"><label for="task-date">Fecha</label><input id="task-date" name="dueDate" type="date"></div><button class="button" type="submit">Añadir</button></form></section><section class="kanban">${Object.entries(statusLabels).map(([status, label]) => `<div class="kanban-column"><div class="column-title">${label}<span class="column-count">${state.tasks.filter(task => task.status === status).length}</span></div>${state.tasks.filter(task => task.status === status).map(taskCard).join('') || '<div class="empty-state">Columna despejada.</div>'}</div>`).join('')}</section>`; }
function calendar() {
  const year = calendarDate.getFullYear(); const month = calendarDate.getMonth(); const first = new Date(year, month, 1); const last = new Date(year, month + 1, 0); const start = (first.getDay() + 6) % 7; const days = [];
  for (let index = 0; index < start; index += 1) days.push('<div class="calendar-day muted"></div>');
  for (let day = 1; day <= last.getDate(); day += 1) { const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const found = state.tasks.find(task => task.dueDate === key); const isToday = key === todayKey(); days.push(`<div class="calendar-day ${found ? 'has-task' : ''} ${isToday ? 'today' : ''}"><span class="day-number">${day}</span>${found ? `<span class="day-task" title="${esc(found.title)}">${esc(found.title)}</span>` : ''}</div>`); }
  while (days.length % 7) days.push('<div class="calendar-day muted"></div>');
  return heading('Calendario.', 'Mira el terreno completo. Las fechas son señales, no cadenas.', '') + `<section class="panel"><div class="calendar-toolbar"><h2>${new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(calendarDate)}</h2><div class="calendar-actions"><button class="square-button" id="prev-month" type="button" aria-label="Mes anterior">←</button><button class="square-button" id="next-month" type="button" aria-label="Mes siguiente">→</button></div></div><div class="calendar-grid"><div class="calendar-day-name">Lun</div><div class="calendar-day-name">Mar</div><div class="calendar-day-name">Mié</div><div class="calendar-day-name">Jue</div><div class="calendar-day-name">Vie</div><div class="calendar-day-name">Sáb</div><div class="calendar-day-name">Dom</div>${days.join('')}</div></section>`;
}
function focus() { const isRunning = state.focus.status === 'running'; return heading('Sala de foco.', 'Veinticinco minutos de presencia. El mundo puede esperar.', '') + `<div class="focus-layout"><section class="panel timer-panel"><div class="eyebrow">POMODORO / ${isRunning ? 'EN CURSO' : state.focus.status === 'complete' ? 'MISIÓN CUMPLIDA' : 'LISTO'}</div><div class="timer-ring ${state.focus.status === 'complete' ? 'complete' : ''}"><span class="timer-value">${formatTime(state.focus.remaining)}</span></div><div class="timer-label">Tiempo para una sola cosa</div><div class="timer-actions"><button class="button secondary" id="timer-toggle" type="button">${isRunning ? 'Pausar' : state.focus.status === 'complete' ? 'Nueva sesión' : 'Iniciar'}</button><button class="button ghost" id="timer-reset" type="button">Reiniciar</button></div></section><section class="panel"><div class="section-kicker">RITUAL</div><h2>Antes de empezar</h2><p>Elige una tarea concreta. Silencia lo que distrae. Cuando suene la señal, registra la sesión y decide el siguiente movimiento.</p><div class="reflection"><h2>Sesiones completadas</h2><p class="big-stat">${state.focusSessions}</p></div></section></div>`; }
function stats() { const completed = state.tasks.filter(task => task.status === 'done').length; const percent = state.tasks.length ? Math.round(completed / state.tasks.length * 100) : 0; const bars = [20, 35, 50, 30, 65, percent || 10, state.focusSessions ? 80 : 16]; return heading('Tu progreso.', 'Los números no te definen. Te ayudan a ver qué ritmo te está funcionando.', '') + `<div class="stats-grid"><section class="panel"><div class="section-kicker">BALANCE ACTUAL</div><span class="big-stat">${percent}%</span><p>de tus misiones están completas.</p><div class="bar-chart">${bars.map((value, index) => `<div class="bar" style="height:${value}%"><span>${['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}</span></div>`).join('')}</div></section><section class="panel"><div class="section-kicker">KIT DE PRODUCTIVIDAD</div><h2>Métodos activos</h2><p>${state.productivityMethods.map(method => method === 'pomodoro' ? 'Pomodoro' : method === 'kanban' ? 'Kanban' : 'Eisenhower').join(' / ') || 'Aún ninguno seleccionado.'}</p><div class="reflection"><h2>Reflexión</h2><p>${esc(state.reflection)}</p></div></section></div>`; }
function settings() { return heading('Ajustes.', 'Haz que el organizador se parezca a tu forma de trabajar.', '') + `<div class="settings-grid"><section class="panel"><div class="section-kicker">ATMÓSFERA</div><h2>Modo visual</h2><div class="choice-row"><button class="choice ${state.selectedTheme === 'vibrant' ? 'selected' : ''}" data-theme-choice="vibrant" type="button">Vibrant</button><button class="choice ${state.selectedTheme === 'drab' ? 'selected' : ''}" data-theme-choice="drab" type="button">Drab</button></div></section><section class="panel"><div class="section-kicker">RITMO</div><h2>Duración Pomodoro</h2><div class="choice-row">${[15, 25, 45].map(minutes => `<button class="choice ${state.pomodoroMinutes === minutes ? 'selected' : ''}" data-duration="${minutes}" type="button">${minutes} min</button>`).join('')}</div></section><section class="panel"><div class="section-kicker">ESTRATEGIAS</div><h2>Métodos activos</h2><div class="method-list">${[['pomodoro', 'Pomodoro / bloques de foco'], ['kanban', 'Kanban / flujo visible'], ['eisenhower', 'Eisenhower / prioridad real']].map(([value, label]) => `<label><input type="checkbox" data-method="${value}" ${state.productivityMethods.includes(value) ? 'checked' : ''}> ${label}</label>`).join('')}</div></section><section class="panel"><div class="section-kicker">KIT PERSONAL</div><h2>Mi reflexión</h2><form id="reflection-form"><div class="field"><label for="reflection">Máximo 200 palabras</label><textarea id="reflection" rows="5">${esc(state.reflection)}</textarea></div><p id="word-count" class="task-meta"></p><button class="button" type="submit">Guardar reflexión</button></form></section></div>`; }
const screens = { dashboard, tasks, calendar, focus, stats, settings };

function bindEvents() {
  const form = document.querySelector('#task-form'); if (form) form.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(form); const title = data.get('title').trim(); if (!title) return showToast('Escribe un título para la misión.'); dispatch(() => state.tasks.push({ id: crypto.randomUUID(), title, status: 'todo', priority: data.get('priority'), dueDate: data.get('dueDate') })); showToast('Misión añadida al tablero.'); });
  document.querySelectorAll('.status-select').forEach(select => select.addEventListener('change', event => { dispatch(() => { const task = state.tasks.find(item => item.id === event.target.dataset.id); if (task) task.status = event.target.value; }); showToast('Estado actualizado.'); }));
  document.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', event => { if (confirm('¿Eliminar esta misión?')) dispatch(() => { state.tasks = state.tasks.filter(task => task.id !== event.currentTarget.dataset.delete); }); }));
  document.querySelector('#prev-month')?.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); render(); });
  document.querySelector('#next-month')?.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); render(); });
  document.querySelector('#timer-toggle')?.addEventListener('click', () => { if (state.focus.status === 'complete') return dispatch(() => resetTimer()); if (state.focus.status === 'running') dispatch(() => { state.focus.remaining = getRemaining(); state.focus.status = 'paused'; state.focus.startedAt = null; }); else dispatch(() => { state.focus.status = 'running'; state.focus.startedAt = Date.now(); }); });
  document.querySelector('#timer-reset')?.addEventListener('click', () => dispatch(resetTimer));
  document.querySelector('#quick-focus')?.addEventListener('click', () => { location.hash = '#focus'; });
  document.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', event => dispatch(() => { state.selectedTheme = event.currentTarget.dataset.themeChoice; })));
  document.querySelectorAll('[data-duration]').forEach(button => button.addEventListener('click', event => dispatch(() => { state.pomodoroMinutes = Number(event.currentTarget.dataset.duration); resetTimer(); })));
  document.querySelectorAll('[data-method]').forEach(input => input.addEventListener('change', event => dispatch(() => { const method = event.target.dataset.method; state.productivityMethods = event.target.checked ? [...new Set([...state.productivityMethods, method])] : state.productivityMethods.filter(item => item !== method); })));
  const reflection = document.querySelector('#reflection'); if (reflection) { const updateCount = () => { const count = reflection.value.trim() ? reflection.value.trim().split(/\s+/).length : 0; document.querySelector('#word-count').textContent = `${count} / 200 palabras`; }; reflection.addEventListener('input', updateCount); updateCount(); document.querySelector('#reflection-form').addEventListener('submit', event => { event.preventDefault(); const words = reflection.value.trim() ? reflection.value.trim().split(/\s+/).length : 0; if (words > 200) return showToast('La reflexión no puede superar 200 palabras.'); dispatch(() => { state.reflection = reflection.value.trim(); }); showToast('Reflexión guardada.'); }); }
}
function getRemaining() { return Math.max(0, state.focus.remaining - Math.floor((Date.now() - state.focus.startedAt) / 1000)); }
function resetTimer() { state.focus = { status: 'stopped', remaining: state.pomodoroMinutes * 60, startedAt: null, duration: state.pomodoroMinutes * 60 }; clearInterval(timerInterval); }
function startTimerLoop() { clearInterval(timerInterval); if (state.focus.status !== 'running') return; timerInterval = setInterval(() => { const remaining = getRemaining(); if (remaining <= 0) { clearInterval(timerInterval); state.focus.remaining = 0; state.focus.status = 'complete'; state.focus.startedAt = null; state.focusSessions += 1; saveState(); render(); showToast('Sesión completada. Buen trabajo.'); } else { document.querySelector('.timer-value').textContent = formatTime(remaining); } }, 500); }

window.addEventListener('hashchange', render);
window.addEventListener('visibilitychange', () => { if (!document.hidden && state.focus.status === 'running') render(); });
render();