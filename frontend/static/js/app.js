/**
 * AZ-500 Exam Simulator — Global Utilities
 * Theme toggle, API helpers, navigation
 */

// ── Theme ──────────────────────────────────────
function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeButtons();
}

function updateThemeButtons() {
    const theme = getTheme();
    document.querySelectorAll('.theme-toggle button').forEach(btn => {
        btn.classList.toggle('active', btn.id === `theme-${theme}`);
    });
}

// Apply saved theme immediately (before DOMContentLoaded)
(function() {
    document.documentElement.setAttribute('data-theme', getTheme());
})();

document.addEventListener('DOMContentLoaded', updateThemeButtons);


// ── API Helper ─────────────────────────────────
async function api(path, options = {}) {
    const defaults = {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
    };
    const config = { ...defaults, ...options };
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    const resp = await fetch(`/api${path}`, config);

    if (resp.status === 401) {
        window.location.href = '/login';
        return null;
    }

    if (resp.status === 410) {
        // Time expired
        return { _expired: true };
    }

    if (!resp.ok) {
        const err = await resp.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(err.detail || `HTTP ${resp.status}`);
    }

    return resp.json();
}

// Legacy API object for backwards compatibility
const API = {
    async get(url) { return api(url.replace('/api', '')); },
    async post(url, data) { return api(url.replace('/api', ''), { method: 'POST', body: data }); }
};

function getActiveCertificationCode() {
    return document.body?.dataset?.certificationCode || '';
}

function getActiveCertificationSlug() {
    return document.body?.dataset?.certificationSlug || '';
}


// ── Navigation helpers ─────────────────────────
async function startMockExam() {
    if (!confirm(t('dashboard.mock_confirm') || 'Start a 150-minute Mock Exam with 60 questions?\nYou cannot pause once started.')) return;
    try {
        const data = await api('/exam/start', {
            method: 'POST',
            body: { mode: 'mock_exam', num_questions: 60, certification_code: getActiveCertificationCode() },
        });
        if (data) window.location.href = `/mock-exams/session/${data.session_id}`;
    } catch (e) {
        alert((t('common.failed_to_start_mock') || 'Failed to start mock exam: ') + e.message);
    }
}

async function startLearning(mode = 'learning', domainId = null) {
    try {
        const body = { mode, certification_code: getActiveCertificationCode() };
        if (domainId) body.domain_id = domainId;
        const data = await api('/exam/start', {
            method: 'POST',
            body,
        });
        if (data) window.location.href = `/learn/session/${data.session_id}`;
    } catch (e) {
        alert((t('common.failed_to_start') || 'Failed to start: ') + e.message);
    }
}

async function startReviewSession() {
    try {
        const data = await api('/exam/start', {
            method: 'POST',
            body: { mode: 'review_pool', certification_code: getActiveCertificationCode() },
        });
        if (data) window.location.href = `/learn/session/${data.session_id}`;
    } catch (e) {
        alert((t('common.failed_to_start_review') || 'Failed to start review: ') + e.message);
    }
}


// ── Utility functions ──────────────────────────
function getProgressClass(pct) {
    if (pct >= 70) return 'high';
    if (pct >= 50) return 'medium';
    return 'low';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}


// ── Markdown rendering (safe, no innerHTML) ────
function renderMarkdownSafe(md, container, options) {
    if (!md) return;
    container.textContent = '';

    const renderOptions = options || {};

    const lines = md.split('\n');
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Fenced code block
        if (line.trim().startsWith('```')) {
            const codeLines = [];
            i++;

            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }

            if (i < lines.length && lines[i].trim().startsWith('```')) {
                i++;
            }

            const pre = document.createElement('pre');
            const code = document.createElement('code');
            appendCodeBlockSafe(code, codeLines, renderOptions, pre);
            pre.appendChild(code);
            container.appendChild(pre);
            continue;
        }

        // Table
        if (line.trim().startsWith('|')) {
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                tableLines.push(lines[i]);
                i++;
            }
            const table = buildTable(tableLines);
            if (table) container.appendChild(table);
            continue;
        }

        // Heading
        const hMatch = line.match(/^(#{1,4})\s+(.+)/);
        if (hMatch) {
            const level = Math.min(hMatch[1].length, 4);
            const el = document.createElement(`h${level}`);
            appendInlineMarkdownSafe(el, hMatch[2]);
            container.appendChild(el);
            i++;
            continue;
        }

        // List item
        if (line.match(/^\s*[-*]\s+/)) {
            const ul = document.createElement('ul');
            while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
                const li = document.createElement('li');
                appendInlineMarkdownSafe(li, lines[i].replace(/^\s*[-*]\s+/, ''));
                ul.appendChild(li);
                i++;
            }
            container.appendChild(ul);
            continue;
        }

        // Empty line
        if (!line.trim()) { i++; continue; }

        // Paragraph
        const p = document.createElement('p');
        appendInlineMarkdownSafe(p, line);
        container.appendChild(p);
        i++;
    }
}

function appendCodeBlockSafe(container, codeLines, options, pre) {
    const lines = codeLines || [];

    lines.forEach(function(line, index) {
        appendCodeLineSafe(container, line, options, pre);
        if (index < lines.length - 1) {
            container.appendChild(document.createTextNode('\n'));
        }
    });
}

function appendCodeLineSafe(container, text, options, pre) {
    const value = String(text || '');
    const dropdownSlots = options && Array.isArray(options.dropdownSlots) ? options.dropdownSlots : null;
    const createDropdownControl = options && typeof options.createDropdownControl === 'function'
        ? options.createDropdownControl
        : null;

    if (!dropdownSlots || !createDropdownControl) {
        container.appendChild(document.createTextNode(value));
        return;
    }

    const placeholderRegex = /\[DROPDOWN_(\d+)\]/g;
    let lastIndex = 0;
    let match;
    let replacedAny = false;

    while ((match = placeholderRegex.exec(value)) !== null) {
        if (match.index > lastIndex) {
            container.appendChild(document.createTextNode(value.slice(lastIndex, match.index)));
        }

        const slotIndex = Number(match[1]) - 1;
        const slot = dropdownSlots[slotIndex];
        if (slot) {
            const control = createDropdownControl(slot, slotIndex, true);
            if (control) {
                container.appendChild(control);
                replacedAny = true;
                if (options.renderedDropdownSlots) {
                    options.renderedDropdownSlots[slotIndex] = true;
                }
                if (pre) {
                    pre.classList.add('code-block-with-dropdowns');
                }
            } else {
                container.appendChild(document.createTextNode(match[0]));
            }
        } else {
            container.appendChild(document.createTextNode(match[0]));
        }

        lastIndex = match.index + match[0].length;
    }

    if (!replacedAny && lastIndex === 0) {
        container.appendChild(document.createTextNode(value));
        return;
    }

    if (lastIndex < value.length) {
        container.appendChild(document.createTextNode(value.slice(lastIndex)));
    }
}

function appendInlineMarkdownSafe(container, text) {
    if (!text) return;

    const value = String(text);
    const codeRegex = /`([^`]+)`/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(value)) !== null) {
        if (match.index > lastIndex) {
            container.appendChild(document.createTextNode(value.slice(lastIndex, match.index).replace(/\*\*/g, '')));
        }

        const code = document.createElement('code');
        code.textContent = match[1];
        container.appendChild(code);
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < value.length) {
        container.appendChild(document.createTextNode(value.slice(lastIndex).replace(/\*\*/g, '')));
    }
}

function buildTable(lines) {
    if (lines.length < 2) return null;
    const table = document.createElement('table');

    const parseRow = (line) =>
        line.split('|').map(c => c.trim()).filter(c => c && !c.match(/^-+$/));

    const headers = parseRow(lines[0]);
    if (!headers.length) return null;

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        appendInlineMarkdownSafe(th, h);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const startIdx = (lines[1] && lines[1].match(/^\|\s*-/)) ? 2 : 1;
    const tbody = document.createElement('tbody');
    for (let j = startIdx; j < lines.length; j++) {
        const cells = parseRow(lines[j]);
        if (!cells.length) continue;
        const tr = document.createElement('tr');
        cells.forEach(c => {
            const td = document.createElement('td');
            appendInlineMarkdownSafe(td, c);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    return table;
}


// ── Review badge ───────────────────────────────
async function updateReviewBadge() {
    try {
        const certificationCode = getActiveCertificationCode();
        const suffix = certificationCode ? `?certification_code=${encodeURIComponent(certificationCode)}` : '';
        const data = await api('/analytics/review-pool' + suffix);
        const badge = document.getElementById('review-badge');
        if (badge && data && data.total > 0) {
            badge.textContent = data.total;
            badge.classList.remove('hidden');
        }
    } catch (e) {
        // Silently ignore — user may not be logged in
    }
}

document.addEventListener('DOMContentLoaded', updateReviewBadge);
