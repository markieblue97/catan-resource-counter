const resources = [
  { id: 'lumber', label: 'Lumber', start: 19 },
  { id: 'brick', label: 'Brick', start: 19 },
  { id: 'wool', label: 'Wool', start: 19 },
  { id: 'grain', label: 'Grain', start: 19 },
  { id: 'ore', label: 'Ore', start: 19 }
];

const state = Object.fromEntries(resources.map(({ id, start }) => [id, start]));
state.development = 25;
const grid = document.querySelector('#resource-grid');
const toast = document.querySelector('#toast');
const undoButton = document.querySelector('#undo-button');
const redoButton = document.querySelector('#redo-button');
const history = [];
const future = [];
let toastTimer;

function renderResources() {
  grid.innerHTML = resources.map(({ id, label }) => `
    <article class="resource ${id}">
      <span class="resource-name">${label}</span>
      <strong class="count" id="${id}-count">${state[id]}</strong>
      <span class="remaining">in the bank</span>
      <div class="resource-actions">
        <button type="button" data-resource="${id}" data-change="1" aria-label="Add 1 ${label}">+1</button>
        <button type="button" data-resource="${id}" data-change="-1" aria-label="Subtract 1 ${label}">−1</button>
        <button type="button" data-resource="${id}" data-change="-2" aria-label="Subtract 2 ${label}">−2</button>
      </div>
    </article>`).join('');
}

function showError(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
}

function snapshot() {
  return { ...state };
}

function renderCounts() {
  resources.forEach(({ id }) => document.querySelector(`#${id}-count`).textContent = state[id]);
  document.querySelector('#development-count').textContent = state.development;
  undoButton.disabled = history.length === 0;
  redoButton.disabled = future.length === 0;
}

function saveHistory(before) {
  history.push(before);
  if (history.length > 100) history.shift();
  future.length = 0;
}

function update(changes) {
  const invalidChange = Object.entries(changes).find(([resource, amount]) => {
    const max = resource === 'development' ? 25 : 19;
    return state[resource] + amount < 0 || state[resource] + amount > max;
  });

  if (invalidChange) {
    const [resource] = invalidChange;
    const max = resource === 'development' ? 25 : 19;
    const label = resource === 'development' ? 'Development cards' : resource[0].toUpperCase() + resource.slice(1);
    showError(`Bank error: ${label} must stay between 0 and ${max}. That action was not applied.`);
    return;
  }

  const before = snapshot();
  Object.entries(changes).forEach(([resource, amount]) => state[resource] += amount);
  saveHistory(before);
  renderCounts();
}

const builds = {
  road: { lumber: 1, brick: 1 },
  settlement: { lumber: 1, brick: 1, wool: 1, grain: 1 },
  city: { grain: 2, ore: 3 },
  development: { wool: 1, grain: 1, ore: 1, development: -1 }
};

grid.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-resource]');
  if (button) update({ [button.dataset.resource]: Number(button.dataset.change) });
});

document.querySelector('.build-grid').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-build]');
  if (button) update(builds[button.dataset.build]);
});

document.querySelector('#reset-button').addEventListener('click', () => {
  if (!window.confirm('Reset every resource to 19 and development cards to 25?')) return;
  const before = snapshot();
  resources.forEach(({ id }) => state[id] = 19);
  state.development = 25;
  saveHistory(before);
  renderCounts();
});

undoButton.addEventListener('click', () => {
  if (!history.length) return;
  future.push(snapshot());
  Object.assign(state, history.pop());
  renderCounts();
});

redoButton.addEventListener('click', () => {
  if (!future.length) return;
  history.push(snapshot());
  Object.assign(state, future.pop());
  renderCounts();
});

renderResources();
renderCounts();
