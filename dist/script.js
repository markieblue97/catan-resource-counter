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
let toastTimer;

function renderResources() {
  grid.innerHTML = resources.map(({ id, label }) => `
    <article class="resource ${id}">
      <span class="resource-name">${label}</span>
      <strong class="count" id="${id}-count">${state[id]}</strong>
      <span class="remaining">in the bank</span>
      <div class="resource-actions">
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

function validate(resource) {
  const max = resource === 'development' ? 25 : 19;
  if (state[resource] < 0 || state[resource] > max) {
    const label = resource === 'development' ? 'development cards' : resource;
    showError(`Bank error: ${label} must stay between 0 and ${max}. Current count: ${state[resource]}.`);
  }
}

function update(changes) {
  Object.entries(changes).forEach(([resource, amount]) => {
    state[resource] += amount;
    validate(resource);
  });
  resources.forEach(({ id }) => document.querySelector(`#${id}-count`).textContent = state[id]);
  document.querySelector('#development-count').textContent = state.development;
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
  resources.forEach(({ id }) => state[id] = 19);
  state.development = 25;
  update({});
});

renderResources();
