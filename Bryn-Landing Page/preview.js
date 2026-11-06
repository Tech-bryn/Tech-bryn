const preview = document.querySelector('.live-demo');
preview.classList.add('is-compact');
const appView = document.querySelector('#app-view');
const dockButtons = [...document.querySelectorAll('.dock-tab')];
const settingsOverlay = document.querySelector('#settings-overlay');
const settingsContent = document.querySelector('#settings-content');
const settingButtons = [...document.querySelectorAll('[data-setting-page]')];
const agendaKey = 'bryn-preview-agenda-v1';
let agendaItems = [];
let todoItems = [];
let noteItems = [];
let clipItems = [];
let agendaTab = 'Agenda';

const pageTemplates = {
  ai: () => `<div class="ai-layout"><aside class="ai-mascot"><div class="mascot-head"><span class="mascot-face"><i></i><i></i></span></div><strong>Bryn AI</strong><span class="mascot-status"><i></i> Siap</span><button class="mascot-shortcut" type="button" data-action="clear-chat">&#8635; Obrolan Baru</button><button class="mascot-shortcut api" type="button" data-action="settings">&#9881; Atur API Key</button></aside><div class="ai-chat"><div class="ai-messages" id="ai-messages"><div class="ai-message"><strong>&#10022; Bryn AI (Google Gemini)</strong>Halo! Saya asisten cerdas Bryn berbasis Google Gemini AI. Tanyakan apa saja tentang pelajaran lab, koding, atau ide!</div><div class="ai-suggestions"><button type="button" data-prompt="Bantu rangkum agenda hari ini">&#128197; Cek Agenda</button><button type="button" data-prompt="Beri 3 tips koding C# WPF yang bersih">&#128187; Tips C#</button><button type="button" data-prompt="Jelaskan cara kerja jaringan lab client-server">&#127760; Lab Jaringan</button></div></div><form class="ai-input" id="ai-form"><input id="ai-input" type="text" placeholder="Tanya Gemini AI & tekan Enter..." aria-label="Tanya Bryn AI"><button type="submit" aria-label="Kirim">&#10148;</button></form><span class="mini-notice" id="ai-notice">Respons hanya contoh, tidak terhubung ke Gemini.</span></div></div>`,
  music: () => `<div class="view-header"><div>Pemutar Musik &amp; Lirik<p>Audio lokal dan lirik sinkron</p></div><span class="view-badge">OFFLINE</span></div><div class="music-layout-native"><div class="music-track"><div class="music-art">&#9835;</div><div><strong id="track-title">Tidak Ada Media</strong><small id="track-artist">Siap memutar audio</small><span class="music-source">Offline</span></div><div class="native-progress"><i id="track-progress"></i></div><div class="native-time"><span id="track-position">00:00</span><span id="track-remaining">-00:00</span></div><div class="native-player"><button type="button" aria-label="Lagu sebelumnya" data-track="prev">&#9198;</button><button type="button" aria-label="Putar atau jeda" data-track="play">&#9654;</button><button type="button" aria-label="Lagu berikutnya" data-track="next">&#9197;</button></div></div><div></div><div class="native-lyrics"><small>&#127908; LIRIK SINKRON REAL-TIME</small><strong id="lyrics-line">&#9835; Putar musik untuk lirik otomatis...</strong></div></div><input id="audio-file" type="file" accept="audio/*" hidden><span class="mini-notice" id="music-notice">Pilih file audio lokal untuk demo pemutar.</span>`,
  radar: () => `<div class="view-header"><div>Klien Terdeteksi <p>Monitor perangkat jaringan lokal</p></div><span class="view-badge">MASTER</span></div><div class="radar-native"><div class="radar-native-head"><span><strong id="client-count">0 Online</strong></span><button type="button" class="mascot-shortcut" data-action="select-clients">Pilih Semua</button></div><div class="radar-empty-native"><strong>Belum ada client terdeteksi</strong><span>Pratinjau ini tidak melakukan scan jaringan.</span></div><span class="mini-notice" id="radar-notice">Data client hanya tersedia di aplikasi desktop.</span></div>`,
  remote: () => `<div class="view-header"><div>Kontrol &amp; Skrip Admin<p>Perintah kontrol lab pada aplikasi Bryn</p></div><span class="view-badge">DEMO AMAN</span></div><div class="remote-native"><div class="remote-actions"><button type="button" disabled>&lt;/&gt; VS Code</button><button type="button" disabled>&#9678; Browser</button><button type="button" disabled>Kunci Lab</button><button type="button" disabled title="Shutdown PC">&#9211;</button></div><div class="remote-field"><span>Perhatian: Buka modul latihan!</span><button type="button" disabled>Kirim</button></div><div class="remote-field"><span>CMD &nbsp; Ketik perintah...</span><button type="button" disabled>Jalankan</button></div><div class="remote-scripts">&#9889; Eksekusi Skrip Admin (.BAT)<small>Kontrol eksekusi dinonaktifkan di preview browser.</small></div></div>`,
  clipboard: () => `<div class="view-header"><div>Papan Klip Sementara<p>Daftar teks demo di sesi browser ini</p></div><span class="view-badge" id="clip-count">0 item</span></div><div class="clip-native"><div class="clip-native-head"><span>Tambahkan teks ke shelf</span><button type="button" data-action="clear-clips">Hapus semua</button></div><textarea id="clip-input" placeholder="Tulis atau tempel teks demo di sini..."></textarea><div class="agenda-add-native"><button type="button" data-action="add-clip">Simpan ke Klip</button></div><div class="agenda-list-native" id="clip-list"></div></div>`,
  agenda: () => `<div class="agenda-native"><div class="agenda-segments" role="tablist" aria-label="Produktivitas Bryn"><button type="button" class="active" data-agenda-tab="Agenda">Agenda <span id="agenda-count">0</span></button><button type="button" data-agenda-tab="To-Do">To-Do <span id="todo-count">0</span></button><button type="button" data-agenda-tab="Catatan">Catatan <span id="note-count">0</span></button></div><div class="view-header"><div id="agenda-heading">Hari Ini, ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date())}<p>Rencana dan pengingat</p></div><button type="button" class="view-badge" data-action="toggle-agenda-form">+ Agenda Baru</button></div><form class="agenda-add-native" id="agenda-form"><input id="agenda-input" maxlength="90" placeholder="Judul agenda..."><input class="time" type="time" id="agenda-time" value="09:00" aria-label="Waktu"><button type="submit">Simpan</button></form><form class="agenda-add-native" id="todo-form" hidden><input id="todo-input" maxlength="90" placeholder="Tugas baru..."><button type="submit">Tambah</button></form><form class="agenda-add-native" id="note-form" hidden><input id="note-input" maxlength="120" placeholder="Catatan singkat..."><button type="submit">Simpan</button></form><div class="agenda-list-native" id="agenda-list"></div></div>`
};

function safeReadState(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    return stored;
  } catch {
    return [];
  }
}

function safeStoreItems(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    return false;
  }
  return true;
}

function renderPage(page) {
  if (!pageTemplates[page]) return;
  dockButtons.forEach((button) => {
    const active = button.dataset.view === page;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  appView.innerHTML = pageTemplates[page]();
  bindPage(page);
}

function appendAiMessage(text, type) {
  const messages = document.querySelector('#ai-messages');
  const bubble = document.createElement('div');
  bubble.className = `ai-message ${type}`;
  bubble.textContent = text;
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function renderAgendaList() {
  const list = document.querySelector('#agenda-list');
  if (!list) return;
  list.replaceChildren();
  const entries = agendaTab === 'Agenda' ? agendaItems : agendaTab === 'To-Do' ? todoItems : noteItems;
  const countId = agendaTab === 'Agenda' ? 'agenda-count' : agendaTab === 'To-Do' ? 'todo-count' : 'note-count';
  document.querySelector(`#${countId}`).textContent = String(entries.length);
  const heading = document.querySelector('#agenda-heading');
  heading.firstChild.textContent = agendaTab === 'Agenda' ? `Hari Ini, ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date())}` : agendaTab;
  heading.querySelector('p').textContent = agendaTab === 'Agenda' ? 'Rencana dan pengingat' : agendaTab === 'To-Do' ? 'Tugas yang perlu diselesaikan' : 'Catatan cepat';
  document.querySelector('#agenda-form').hidden = agendaTab !== 'Agenda';
  document.querySelector('#todo-form').hidden = agendaTab !== 'To-Do';
  document.querySelector('#note-form').hidden = agendaTab !== 'Catatan';
  document.querySelector('[data-action="toggle-agenda-form"]').hidden = agendaTab !== 'Agenda';
  document.querySelectorAll('[data-agenda-tab]').forEach((button) => button.classList.toggle('active', button.dataset.agendaTab === agendaTab));
  if (!entries.length) {
    const empty = document.createElement('span');
    empty.className = 'agenda-empty-native';
    empty.textContent = agendaTab === 'Agenda' ? "Tidak ada agenda hari ini · Pilih '+ Agenda Baru'" : agendaTab === 'To-Do' ? 'Semua tugas selesai' : 'Belum ada catatan';
    list.append(empty);
    return;
  }
  entries.forEach((entry, index) => {
    const row = document.createElement('div');
    row.className = 'agenda-row-native';
    if (agendaTab !== 'Catatan') {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = Boolean(entry.done);
      checkbox.addEventListener('change', () => {
        entry.done = checkbox.checked;
        persistAgendaItems();
        renderAgendaList();
      });
      row.append(checkbox);
    }
    const title = document.createElement('span');
    title.textContent = agendaTab === 'Catatan' ? entry.text : entry.title;
    row.append(title);
    if (entry.time) {
      const time = document.createElement('small');
      time.textContent = entry.time;
      row.append(time);
    }
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-row';
    remove.setAttribute('aria-label', 'Hapus item');
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      entries.splice(index, 1);
      persistAgendaItems();
      renderAgendaList();
    });
    row.append(remove);
    list.append(row);
  });
}

function persistAgendaItems() {
  safeStoreItems(agendaKey, { agendaItems, todoItems, noteItems });
}

function renderClipList() {
  const list = document.querySelector('#clip-list');
  if (!list) return;
  list.replaceChildren();
  document.querySelector('#clip-count').textContent = `${clipItems.length} item`;
  if (!clipItems.length) {
    const empty = document.createElement('span');
    empty.className = 'agenda-empty-native';
    empty.textContent = 'Belum ada item. Tambahkan teks untuk mencoba shelf.';
    list.append(empty);
    return;
  }
  clipItems.forEach((text, index) => {
    const row = document.createElement('div');
    row.className = 'agenda-row-native';
    const value = document.createElement('span');
    value.textContent = text;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-row';
    remove.setAttribute('aria-label', 'Hapus item');
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      clipItems.splice(index, 1);
      renderClipList();
    });
    row.append(value, remove);
    list.append(row);
  });
}

function bindPage(page) {
  if (page === 'ai') {
    const form = document.querySelector('#ai-form');
    const input = document.querySelector('#ai-input');
    const send = (message) => {
      const value = message.trim();
      if (!value) return;
      appendAiMessage(value, 'user');
      appendAiMessage('Respons pratinjau: hubungkan Bryn ke penyedia AI untuk jawaban langsung.', '');
      input.value = '';
    };
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      send(input.value);
    });
    document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => send(button.dataset.prompt)));
    document.querySelector('[data-action="clear-chat"]').addEventListener('click', () => renderPage('ai'));
    document.querySelector('[data-action="settings"]').addEventListener('click', openSettings);
  }
  if (page === 'music') {
    const fileInput = document.querySelector('#audio-file');
    document.querySelectorAll('[data-track]').forEach((button) => button.addEventListener('click', () => {
      document.querySelector('#music-notice').textContent = button.dataset.track === 'play' ? 'Kontrol pemutaran hanya simulasi dalam preview.' : 'Tidak ada daftar lagu demo yang terhubung.';
    }));
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) document.querySelector('#music-notice').textContent = `${file.name} dipilih lokal; preview tidak mengunggah file ini.`;
    });
    document.querySelector('#track-title').addEventListener('click', () => fileInput.click());
    document.querySelector('#track-title').title = 'Pilih file lokal';
  }
  if (page === 'radar') {
    document.querySelector('[data-action="select-clients"]').addEventListener('click', () => {
      document.querySelector('#radar-notice').textContent = 'Tidak ada perangkat di daftar preview.';
    });
  }
  if (page === 'clipboard') {
    renderClipList();
    document.querySelector('[data-action="add-clip"]').addEventListener('click', () => {
      const input = document.querySelector('#clip-input');
      if (!input.value.trim()) return;
      clipItems.unshift(input.value.trim().slice(0, 120));
      input.value = '';
      renderClipList();
    });
    document.querySelector('[data-action="clear-clips"]').addEventListener('click', () => {
      clipItems = [];
      renderClipList();
    });
  }
  if (page === 'agenda') {
    const stored = safeReadState(agendaKey);
    if (Array.isArray(stored)) {
      agendaItems = stored.map((item) => ({
        title: item.title || item.text || '',
        time: item.time || '',
        done: Boolean(item.done)
      })).filter((item) => item.title);
      todoItems = [];
      noteItems = [];
    } else {
      agendaItems = Array.isArray(stored?.agendaItems) ? stored.agendaItems : [];
      todoItems = Array.isArray(stored?.todoItems) ? stored.todoItems : [];
      noteItems = Array.isArray(stored?.noteItems) ? stored.noteItems : [];
    }
    renderAgendaList();
    document.querySelectorAll('[data-agenda-tab]').forEach((button) => button.addEventListener('click', () => {
      agendaTab = button.dataset.agendaTab;
      renderAgendaList();
    }));
    document.querySelector('[data-action="toggle-agenda-form"]').addEventListener('click', () => document.querySelector('#agenda-input').focus());
    document.querySelector('#agenda-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const input = document.querySelector('#agenda-input');
      if (!input.value.trim()) return;
      agendaItems.push({ title: input.value.trim(), time: document.querySelector('#agenda-time').value || '09:00', done: false });
      persistAgendaItems();
      renderAgendaList();
    });
    document.querySelector('#todo-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const input = document.querySelector('#todo-input');
      if (!input.value.trim()) return;
      todoItems.push({ title: input.value.trim(), done: false });
      persistAgendaItems();
      renderAgendaList();
    });
    document.querySelector('#note-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const input = document.querySelector('#note-input');
      if (!input.value.trim()) return;
      noteItems.push({ text: input.value.trim() });
      persistAgendaItems();
      renderAgendaList();
    });
  }
}

function openSettings() {
  settingsOverlay.hidden = false;
}

function closeSettings() {
  settingsOverlay.hidden = true;
}

function renderSettingsPage(title) {
  const normalizedTitle = title.replaceAll('&amp;', '&');
  settingsContent.replaceChildren();
  const heading = document.createElement('h3');
  heading.textContent = normalizedTitle;
  settingsContent.append(heading);
  const info = document.createElement('p');
  info.className = 'settings-info';
  const descriptions = {
    'Jaringan Lab': 'Peran komputer dan pemindaian client hanya berupa contoh. Preview tidak mengirim paket jaringan.',
    'Standby & Robot': 'Animasi robot dapat dicoba di kapsul. Pengaturan sistem hanya tampilan demo.',
    'Tampilan & Animasi': 'Sesuaikan gaya visual kapsul pratinjau.',
    Bahasa: 'Bahasa Indonesia (Utama) · English (United States)',
    'Musik & Lirik Offline': 'Musik lokal tidak diunggah; pilih file hanya untuk tampilan demo.',
    'Kalender & Agenda': 'Agenda di preview disimpan lokal di browser ini.',
    'To-Do & Catatan': 'Daftar demo terpisah dari data aplikasi desktop.',
    'AI Gemini, Groq & DeepSeek': 'Kredensial API asli tidak diminta atau disimpan oleh situs preview.'
  };
  info.textContent = descriptions[normalizedTitle] || 'Pengaturan pratinjau ini tidak mengubah Windows.';
  settingsContent.append(info);
  if (normalizedTitle === 'Umum' || normalizedTitle === 'Standby & Robot') {
    addSettingRow('Animasi kapsul', 'Efek visual dalam browser', true);
    addSettingRow('Mata robot standby', 'Animasi robot pada kapsul compact', true);
  } else if (normalizedTitle === 'Tampilan & Animasi') {
    addSettingRow('Efek kaca', 'Panel liquid glass pada preview', true);
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '20';
    slider.max = '100';
    slider.value = '92';
    slider.setAttribute('aria-label', 'Transparansi kapsul');
    slider.addEventListener('input', () => document.querySelector('.island-window').style.opacity = String(Number(slider.value) / 100));
    settingsContent.append(slider);
  }
}

function addSettingRow(title, description, initialValue) {
  const row = document.createElement('div');
  row.className = 'settings-row';
  const copy = document.createElement('div');
  const label = document.createElement('strong');
  label.textContent = title;
  const detail = document.createElement('small');
  detail.textContent = description;
  copy.append(label, detail);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = `settings-switch${initialValue ? ' is-on' : ''}`;
  toggle.setAttribute('role', 'switch');
  toggle.setAttribute('aria-checked', String(initialValue));
  toggle.setAttribute('aria-label', title);
  toggle.addEventListener('click', () => {
    const enabled = toggle.getAttribute('aria-checked') !== 'true';
    toggle.setAttribute('aria-checked', String(enabled));
    toggle.classList.toggle('is-on', enabled);
  });
  row.append(copy, toggle);
  settingsContent.append(row);
}

dockButtons.forEach((button) => button.addEventListener('click', () => renderPage(button.dataset.view)));
document.querySelectorAll('[data-action="expand"]').forEach((button) => button.addEventListener('click', () => preview.classList.remove('is-compact')));
document.querySelectorAll('[data-action="collapse"]').forEach((button) => button.addEventListener('click', () => preview.classList.add('is-compact')));
document.querySelector('[data-action="pin"]').addEventListener('click', (event) => {
  const pinned = preview.classList.toggle('is-pinned');
  event.currentTarget.textContent = pinned ? '●' : '⌖';
});
document.querySelector('[data-action="settings"]').addEventListener('click', openSettings);
document.querySelector('[data-action="close-settings"]').addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', (event) => {
  if (event.target === settingsOverlay) closeSettings();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeSettings();
});
settingButtons.forEach((button) => button.addEventListener('click', () => {
  settingButtons.forEach((item) => item.classList.toggle('selected', item === button));
  renderSettingsPage(button.dataset.settingPage);
}));

const updateClock = () => {
  const now = new Date();
  const time = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(now);
  document.querySelector('#demo-date').textContent = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }).format(now);
  document.querySelector('#demo-clock').textContent = time;
  document.querySelector('#compact-clock').textContent = time;
  document.querySelector('#notch-clock').textContent = time;
};

updateClock();
window.setInterval(updateClock, 30000);
renderPage('ai');
renderSettingsPage('Umum');

const primaryNav = document.querySelector('.nav');
const brandLink = document.querySelector('.brand');
const notchTrigger = document.querySelector('.notch-trigger');
const navMenu = document.querySelector('#primary-menu');
const topbar = document.querySelector('.topbar');
const mobileLayout = window.matchMedia('(max-width: 760px)');
const toolButtons = [...document.querySelectorAll('.tool-trigger')];

function setMobileMenu(open) {
  primaryNav.classList.toggle('is-open', open);
  notchTrigger.setAttribute('aria-expanded', String(open));
}

function syncResponsiveControls() {
  const isMobile = mobileLayout.matches;
  topbar.classList.remove('nav-hidden');
  setMobileMenu(false);
  toolButtons.forEach((button) => {
    button.setAttribute('aria-expanded', String(!isMobile || button.closest('.tool-item').classList.contains('is-open')));
  });
}

notchTrigger.addEventListener('click', () => {
  if (!mobileLayout.matches) return;
  const isOpen = primaryNav.classList.contains('is-open');
  setMobileMenu(!isOpen);
});

brandLink.addEventListener('click', () => {
  if (mobileLayout.matches) setMobileMenu(false);
});

navMenu.addEventListener('click', (event) => {
  if (!mobileLayout.matches || !event.target.closest('a')) return;
  setMobileMenu(false);
});

document.addEventListener('pointerdown', (event) => {
  if (mobileLayout.matches && primaryNav.classList.contains('is-open') && !primaryNav.contains(event.target)) {
    setMobileMenu(false);
  }
});

toolButtons.forEach((button) => button.addEventListener('click', () => {
  if (!mobileLayout.matches) return;
  const selectedItem = button.closest('.tool-item');
  const shouldOpen = !selectedItem.classList.contains('is-open');
  document.querySelectorAll('.tool-item.is-open').forEach((item) => {
    item.classList.remove('is-open');
    item.querySelector('.tool-trigger').setAttribute('aria-expanded', 'false');
  });
  selectedItem.classList.toggle('is-open', shouldOpen);
  button.setAttribute('aria-expanded', String(shouldOpen));
}));

let previousScrollY = window.scrollY;
let pointerNearTop = false;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  if (mobileLayout.matches) {
    topbar.classList.remove('nav-hidden');
  } else if (currentScrollY < 70 || currentScrollY < previousScrollY - 3) {
    topbar.classList.remove('nav-hidden');
  } else if (currentScrollY > previousScrollY + 3 && currentScrollY > 120 && !pointerNearTop) {
    topbar.classList.add('nav-hidden');
  }
  previousScrollY = currentScrollY;
}, { passive: true });

window.addEventListener('pointermove', (event) => {
  if (mobileLayout.matches) return;
  pointerNearTop = event.clientY <= 90;
  if (pointerNearTop) topbar.classList.remove('nav-hidden');
});

window.addEventListener('resize', syncResponsiveControls);
syncResponsiveControls();

const revealTargets = document.querySelectorAll('.section-head, .tool-item, .about-copy, .closing-panel, .desktop-frame');
revealTargets.forEach((target) => target.classList.add('scroll-reveal'));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      if (entry.target.matches('.desktop-frame')) {
        entry.target.classList.add('is-primed');
        window.setTimeout(() => entry.target.classList.add('is-visible'), 420);
      } else {
        entry.target.classList.add('is-visible');
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add('is-visible'));
}
