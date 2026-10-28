'use strict';
const profile = window.PORTFOLIO;

// Content is rendered before animations and project listeners are initialized.
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
(profile.radar || []).forEach((item) => {
  const card = element('div', 'radar-item');
  const icon = element('span', 'explore-icon', item.icon || '◇');
  icon.setAttribute('aria-hidden', 'true');
  const copy = element('p', '', item.title);
  copy.append(element('small', '', item.description));
  card.append(icon, copy);
  document.querySelector('#radar-items').append(card);
});
(profile.milestones || []).forEach((item, index, items) => {
  const card = element('article');
  card.append(
    element('span', 'timeline-number' + (index === items.length - 1 ? ' current' : ''), String(index + 1).padStart(2, '0')),
    element('p', 'micro-label', item.label),
    element('h3', '', item.title),
    element('p', '', item.description),
    element('span', 'journey-tag', item.tag),
  );
  document.querySelector('#milestone-items').append(card);
});
(profile.projects || []).forEach((project, index) => {
  const card = element('button', 'project-card reveal');
  card.type = 'button';
  card.dataset.project = String(index);
  const template = [...document.querySelectorAll('[data-project-visual]')]
    .find((item) => item.dataset.projectVisual === project.visual);
  if (template) card.append(template.content.cloneNode(true));
  else {
    const visual = element('div', 'project-visual construct-visual');
    const preview = element('div', 'construct-preview');
    preview.append(element('p', 'micro-label', project.concept ? 'PROJECT CONCEPT' : 'PERSONAL PROJECT'), element('h3', '', project.title));
    visual.append(preview);
    card.append(visual);
  }
  // The project title and details always come from profile.js.
  const previewTitle = card.querySelector('.construct-preview h3');
  if (previewTitle) previewTitle.textContent = project.title;
  const info = element('div', 'project-info');
  const title = element('div', 'project-title');
  title.append(element('h3', '', project.title), element('span', '', '↗'));
  const tags = element('div', 'tags');
  (project.tags || []).forEach((tag) => tags.append(element('span', '', tag)));
  info.append(title, element('p', '', project.summary || project.description), tags);
  card.append(info);
  document.querySelector('#project-items').append(card);
});

Object.entries(profile.socials || {}).forEach(([key, value]) => {
  const label = { github: 'GitHub', linkedin: 'LinkedIn', twitter: 'Twitter' }[key] || key;
  let url;
  try { url = new URL(value); } catch { /* Empty URLs show a placeholder. */ }
  const container = document.querySelector('.contact-socials');
  if (url?.protocol === 'https:') {
    const link = element('a', '', label + ' ↗');
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    container.append(link);
  } else {
    const placeholder = element('span', 'social-placeholder', label);
    placeholder.append(element('small', '', 'Coming soon'));
    container.append(placeholder);
  }
});

document.querySelectorAll('[data-name]').forEach((el) => {
  el.textContent = profile.name;
});
document.title = `${profile.name} — A CS Journey`;
document.querySelector('#year').textContent = new Date().getFullYear();
const email = document.querySelector('#email-link');
if (profile.email) {
  email.href = `mailto:${profile.email}`;
  document.querySelector('.contact-placeholder').hidden = true;
} else {
  email.removeAttribute('href');
  email.setAttribute('role', 'button');
  email.tabIndex = 0;
  const explain = () => {
    document.querySelector('.contact-placeholder').textContent =
      'Your email is not set yet. Add it in profile.js to enable contact.';
  };
  email.addEventListener('click', explain);
  email.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      explain();
    }
  });
}
const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute(
    'aria-label',
    open ? 'Close navigation' : 'Open navigation',
  );
  document.querySelector('nav').classList.toggle('open', open);
});
document.querySelectorAll('nav a').forEach((a) =>
  a.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false');
    document.querySelector('nav').classList.remove('open');
  }),
);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    menu.setAttribute('aria-expanded', 'false');
    document.querySelector('nav').classList.remove('open');
  }
});
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reduced.matches) {
  document.body.classList.add('js-motion');
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

// Decorative constellation, drawn locally so the portfolio has no image dependencies.
const canvas = document.querySelector('#constellation'),
  ctx = canvas.getContext('2d');
const points = [
  [0.18, 0.39],
  [0.3, 0.27],
  [0.49, 0.18],
  [0.65, 0.33],
  [0.83, 0.42],
  [0.62, 0.53],
  [0.43, 0.47],
  [0.3, 0.67],
  [0.51, 0.76],
  [0.73, 0.73],
  [0.81, 0.59],
  [0.44, 0.34],
  [0.18, 0.57],
];
const edges = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 1],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 4],
  [5, 9],
  [6, 8],
  [2, 11],
  [11, 6],
  [11, 3],
  [0, 12],
  [12, 7],
  [7, 9],
  [3, 5],
];
let w = 0,
  h = 0,
  artVisible = true,
  frame = 0;
function resizeArt() {
  const box = canvas.getBoundingClientRect();
  w = box.width;
  h = box.height;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (reduced.matches) drawArt(0);
}
function drawArt(time) {
  ctx.clearRect(0, 0, w, h);
  const p = points.map(([x, y], i) => [
    x * w + (reduced.matches ? 0 : Math.sin(time / 2400 + i) * 5),
    y * h + (reduced.matches ? 0 : Math.cos(time / 2800 + i) * 7),
  ]);
  for (let i = 0; i < 50; i++) {
    const x = (((i * 137.5) % 100) / 100) * w,
      y = (((i * 59.7) % 100) / 100) * h;
    ctx.fillStyle = `rgba(145,186,226,${0.15 + (i % 4) * 0.1})`;
    ctx.fillRect(x, y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
  }
  edges.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(...p[a]);
    ctx.lineTo(...p[b]);
    ctx.strokeStyle = '#5985b34d';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });
  p.forEach(([x, y], i) => {
    const big = [2, 4, 6, 9].includes(i);
    ctx.beginPath();
    ctx.arc(x, y, big ? 6 : 3, 0, Math.PI * 2);
    ctx.fillStyle = big ? '#a3efd4' : '#7ba4df';
    ctx.shadowColor = big ? '#a3efd4' : '#7ba4df';
    ctx.shadowBlur = big ? 22 : 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}
function animate(time) {
  if (artVisible && !document.hidden) drawArt(time);
  frame = requestAnimationFrame(animate);
}
new ResizeObserver(resizeArt).observe(canvas);
if ('IntersectionObserver' in window)
  new IntersectionObserver((entries) => {
    artVisible = entries[0].isIntersecting;
  }).observe(canvas);
resizeArt();
if (!reduced.matches) frame = requestAnimationFrame(animate);
reduced.addEventListener('change', () => {
  cancelAnimationFrame(frame);
  if (!reduced.matches) frame = requestAnimationFrame(animate);
  else drawArt(0);
});

const walls = new Set([16, 28, 40, 52, 21, 33, 45, 57, 69, 66, 78, 30, 31]);
const route = new Set([
  60, 61, 62, 50, 38, 26, 14, 15, 3, 4, 5, 6, 7, 8, 9, 10, 11, 23,
]);
function makeGrid(el, preview = false) {
  el.replaceChildren();
  for (let i = 0; i < 96; i++) {
    const cell = document.createElement('span');
    cell.className = 'path-cell';
    if (walls.has(i)) cell.classList.add('wall');
    if (preview && route.has(i)) cell.classList.add('route');
    if (i === 60 || i === 23) {
      cell.classList.add('endpoint');
      cell.textContent = i === 60 ? 'S' : 'G';
    }
    el.append(cell);
  }
}
document.querySelectorAll('#project-items .path-grid').forEach((grid) => makeGrid(grid, true));
const dialog = document.querySelector('#project-dialog');
let runId = 0;
document.querySelectorAll('[data-project]').forEach((button) =>
  button.addEventListener('click', () => {
    runId++;
    const key = button.dataset.project,
      project = profile.projects[key];
    document.querySelector('#dialog-title').textContent = project.title;
    document.querySelector('#dialog-description').textContent =
      project.description;
    const repo = document.querySelector('#dialog-repo');
    const validRepo = /^https:\/\//.test(project.repository);
    repo.hidden = !validRepo;
    if (validRepo) repo.href = project.repository;
    const demo = document.querySelector('#dialog-demo');
    demo.replaceChildren();
    if (project.demo === 'study') {
      const tasks = document.createElement('div');
      tasks.className = 'demo-tasks';
      [
        'Review graph algorithms',
        'Build something interesting',
        'Take a well-earned break',
      ].forEach((text) => {
        const label = document.createElement('label'),
          check = document.createElement('input');
        check.type = 'checkbox';
        label.append(check, document.createTextNode(text));
        tasks.append(label);
      });
      demo.append(tasks);
    } else if (project.demo === 'path') {
      const grid = document.createElement('div');
      grid.className = 'demo-grid';
      grid.setAttribute('aria-hidden', 'true');
      makeGrid(grid);
      const status = document.createElement('p');
      status.className = 'demo-status';
      status.setAttribute('role', 'status');
      status.textContent = 'Ready to find a path.';
      const run = document.createElement('button');
      run.className = 'button primary';
      run.textContent = 'Find shortest path ↗';
      run.addEventListener('click', () => solve(grid, status, run));
      demo.append(grid, status, run);
    }
    document.querySelector('#dialog-label').textContent =
      project.concept ? 'PROJECT CONCEPT' : 'PERSONAL PROJECT';
    document.querySelector('.dialog-note').hidden = !project.concept;
    dialog.showModal();
  }),
);
document
  .querySelector('.dialog-close')
  .addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => runId++);
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    )
      dialog.close();
  }
});
async function solve(grid, status, button) {
  const id = ++runId;
  button.disabled = true;
  makeGrid(grid);
  const queue = [60],
    seen = new Set([60]),
    parent = new Map();
  let found = false;
  status.textContent = 'Exploring the grid…';
  for (let head = 0; head < queue.length; head++) {
    if (id !== runId) return;
    const cell = queue[head];
    if (cell === 23) {
      found = true;
      break;
    }
    if (cell !== 60) grid.children[cell].classList.add('visited');
    const row = Math.floor(cell / 12),
      col = cell % 12;
    for (const [dr, dc] of [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ]) {
      const r = row + dr,
        c = col + dc,
        next = r * 12 + c;
      if (
        r >= 0 &&
        r < 8 &&
        c >= 0 &&
        c < 12 &&
        !seen.has(next) &&
        !walls.has(next)
      ) {
        seen.add(next);
        parent.set(next, cell);
        queue.push(next);
      }
    }
    if (!reduced.matches)
      await new Promise((resolve) => setTimeout(resolve, 24));
  }
  if (id !== runId) return;
  if (found) {
    let cell = 23,
      steps = 0;
    while (cell !== 60) {
      grid.children[cell].classList.add('route');
      cell = parent.get(cell);
      steps++;
    }
    status.textContent = `Shortest path found: ${steps} steps. Explored ${seen.size} cells.`;
  } else status.textContent = 'No route found.';
  button.disabled = false;
  button.textContent = 'Run again ↗';
}
