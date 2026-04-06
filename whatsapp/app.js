(() => {
  const STORAGE_KEY = 'wa_groups';

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const messageEl    = document.getElementById('message');
  const groupInput   = document.getElementById('group-input');
  const btnAddGroup  = document.getElementById('btn-add-group');
  const groupList    = document.getElementById('group-list');
  const btnStart     = document.getElementById('btn-start');
  const btnNext      = document.getElementById('btn-next');
  const btnCopy      = document.getElementById('btn-copy');
  const statusEl     = document.getElementById('status');
  const statusCounter = document.getElementById('status-counter');
  const statusGroup  = document.getElementById('status-group');

  // ── State ─────────────────────────────────────────────────────────────────
  let groups = [];          // { id, name }[]
  let session = null;       // { selected: string[], index: number } | null

  // ── Persistence ───────────────────────────────────────────────────────────
  function loadGroups() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      groups = raw ? JSON.parse(raw) : [];
    } catch {
      groups = [];
    }
  }

  function saveGroups() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }

  // ── Render ────────────────────────────────────────────────────────────────
  function renderGroups() {
    groupList.innerHTML = '';
    groups.forEach(({ id, name }) => {
      const li = document.createElement('li');
      li.className = 'group-item';
      li.dataset.id = id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'group-item__checkbox';
      checkbox.id = `chk-${id}`;
      checkbox.checked = true;
      checkbox.setAttribute('aria-label', name);

      const label = document.createElement('label');
      label.className = 'group-item__name';
      label.htmlFor = `chk-${id}`;
      label.textContent = name;

      const delBtn = document.createElement('button');
      delBtn.className = 'group-item__delete';
      delBtn.textContent = '×';
      delBtn.setAttribute('aria-label', `Delete ${name}`);
      delBtn.addEventListener('click', () => deleteGroup(id));

      li.append(checkbox, label, delBtn);
      groupList.appendChild(li);
    });
  }

  function updateStatus() {
    if (!session) {
      statusEl.hidden = true;
      return;
    }
    const { selected, index } = session;
    statusEl.hidden = false;
    statusCounter.textContent = `${index + 1} of ${selected.length}`;
    statusGroup.textContent = selected[index];

    // Highlight active group in list
    groupList.querySelectorAll('.group-item').forEach(li => {
      const nameEl = li.querySelector('.group-item__name');
      li.classList.toggle('is-active', nameEl.textContent === selected[index]);
    });
  }

  // ── Group management ──────────────────────────────────────────────────────
  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function addGroup(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    groups.push({ id: generateId(), name: trimmed });
    saveGroups();
    renderGroups();
  }

  function deleteGroup(id) {
    groups = groups.filter(g => g.id !== id);
    saveGroups();
    renderGroups();
  }

  // ── Clipboard ─────────────────────────────────────────────────────────────
  async function copyMessage() {
    const text = messageEl.value;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers without Clipboard API support
      try {
        messageEl.select();
        const ok = document.execCommand('copy'); // eslint-disable-line
        if (!ok) throw new Error('execCommand failed');
      } catch {
        alert('Could not copy the message automatically. Please copy it manually.');
      }
    }
  }

  // ── Session helpers ───────────────────────────────────────────────────────
  function getCheckedNames() {
    return [...groupList.querySelectorAll('.group-item')]
      .filter(li => li.querySelector('.group-item__checkbox').checked)
      .map(li => li.querySelector('.group-item__name').textContent);
  }

  function setNextDisabled(value) {
    btnNext.disabled = value;
  }

  // ── Button handlers ───────────────────────────────────────────────────────
  btnAddGroup.addEventListener('click', () => {
    addGroup(groupInput.value);
    groupInput.value = '';
    groupInput.focus();
  });

  groupInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') btnAddGroup.click();
  });

  btnStart.addEventListener('click', async () => {
    const selected = getCheckedNames();
    if (!selected.length) {
      alert('Please select at least one group.');
      return;
    }
    if (!messageEl.value.trim()) {
      alert('Please enter a message.');
      return;
    }

    session = { selected, index: 0 };
    await copyMessage();
    window.open('https://web.whatsapp.com/', '_blank', 'noopener,noreferrer');
    updateStatus();
    setNextDisabled(selected.length <= 1);
  });

  btnNext.addEventListener('click', async () => {
    if (!session) return;
    session.index += 1;
    await copyMessage();
    updateStatus();
    if (session.index >= session.selected.length - 1) {
      setNextDisabled(true);
    }
  });

  btnCopy.addEventListener('click', copyMessage);

  // ── Init ──────────────────────────────────────────────────────────────────
  loadGroups();
  renderGroups();
})();
