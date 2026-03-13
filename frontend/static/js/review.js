/**
 * Review pool page — bookmarked and failed questions.
 * Safe DOM construction (no innerHTML).
 */

let reviewPoolData = null;
let reviewPoolPromise = null;

function getReviewPage() {
    return document.getElementById('review-page');
}

function getReviewScope() {
    return getReviewPage()?.dataset?.scope === 'active' ? 'active' : 'all';
}

function isReviewScopeActive() {
    return getReviewScope() === 'active';
}

function isReviewPracticeEnabled() {
    return getReviewPage()?.dataset?.practiceEnabled === 'true';
}

function getReviewCertificationCode() {
    return isReviewScopeActive() ? getActiveCertificationCode() : '';
}

function reviewQuerySuffix() {
    const certificationCode = getReviewCertificationCode();
    return certificationCode ? `?certification_code=${encodeURIComponent(certificationCode)}` : '';
}

function applyReviewScopeCopy() {
    const activeScope = isReviewScopeActive();
    const subtitle = document.getElementById('review-subtitle');
    const scopeNote = document.getElementById('review-scope-note');
    const actionNote = document.getElementById('review-action-note');

    if (subtitle) {
        subtitle.textContent = activeScope
            ? reviewText('subtitle_active', 'Bookmarked and incorrectly answered questions for your active certification')
            : reviewText('subtitle_all', 'Bookmarked and incorrectly answered questions across all certifications');
    }

    if (scopeNote) {
        scopeNote.textContent = activeScope
            ? reviewText('scope_note_active', 'Only review items for the active certification are shown.')
            : reviewText('scope_note_all', 'Cross-cert review items are shown. Practice sessions stay certification-specific.');
    }

    if (actionNote) {
        if (isReviewPracticeEnabled()) {
            actionNote.textContent = '';
        } else if (getActiveCertificationCode()) {
            actionNote.textContent = reviewText('practice_scope_note', 'Switch to This Certification to start a review session.');
        } else {
            actionNote.textContent = reviewText('practice_choose_cert', 'Choose an active certification to start a review session.');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (Object.keys(I18N.translations || {}).length > 0) {
        initReviewPage();
    }
});

document.addEventListener('i18n:ready', initReviewPage);

function reviewText(key, fallback, params) {
    return t(`review.${key}`, params) || fallback;
}

async function ensureReviewPoolData() {
    if (reviewPoolData) return reviewPoolData;
    if (!reviewPoolPromise) {
        reviewPoolPromise = api('/analytics/review-pool' + reviewQuerySuffix()).then(data => {
            reviewPoolData = data;
            return data;
        });
    }
    return reviewPoolPromise;
}

async function initReviewPage() {
    applyReviewScopeCopy();
    await loadReviewPool();
}

async function loadReviewPool() {
    try {
        const data = await ensureReviewPoolData();

        const total = data.total || 0;
        const items = data.items || [];
        const bookmarks = items.filter(i => i.source === 'manual_bookmark').length;
        const examErrors = items.filter(i => i.source === 'mock_exam_error' || i.source === 'learning_error').length;

        document.getElementById('review-total').textContent = total;
        document.getElementById('review-bookmarks').textContent = bookmarks;
        document.getElementById('review-exams').textContent = examErrors;

        const startButton = document.getElementById('btn-start-review');
        if (startButton) {
            startButton.disabled = !isReviewPracticeEnabled() || total === 0;
        }

        renderItems(items);
    } catch (e) {
        console.error('Failed to load review pool', e);
    }
}

function renderItems(items) {
    const container = document.getElementById('review-items');
    container.textContent = '';

    if (!items || items.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'text-align: center; padding: 40px 20px; color: var(--c-text-muted);';

        const icon = document.createElement('div');
        icon.style.cssText = 'font-size: 32px; margin-bottom: 12px; opacity: 0.4;';
        icon.textContent = '\u2714';
        empty.appendChild(icon);

        const title = document.createElement('p');
        title.style.cssText = 'font-size: 15px; font-weight: 500; margin-bottom: 4px; color: var(--c-text);';
        title.textContent = reviewText('empty_title', 'Review pool is empty');
        empty.appendChild(title);

        const hint = document.createElement('p');
        hint.style.cssText = 'font-size: 13px;';
        hint.textContent = isReviewScopeActive()
            ? reviewText('empty_hint_active', 'Questions you bookmark or answer incorrectly for this certification will appear here.')
            : reviewText('empty_hint_all', 'Questions you bookmark or answer incorrectly across all certifications will appear here.');
        empty.appendChild(hint);

        container.appendChild(empty);
        return;
    }

    const showCertification = !isReviewScopeActive();

    // Table
    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse;';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.cssText = 'border-bottom: 1px solid var(--c-border);';
    const headers = [
        reviewText('question', 'Question'),
        ...(showCertification ? [reviewText('certification', 'Certification')] : []),
        reviewText('source', 'Source'),
        reviewText('failed', 'Failed'),
        reviewText('added', 'Added'),
        ''
    ];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.style.cssText = 'text-align: left; padding: 8px 8px 8px 0; font-size: 11px; font-weight: 600; color: var(--c-text-muted); text-transform: uppercase; letter-spacing: 0.5px;';
        if (text === '') th.style.textAlign = 'right';
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    items.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.cssText = 'border-bottom: 1px solid var(--c-border);';
        tr.id = 'review-row-' + item.id;

        // Question ID
        const tdQ = document.createElement('td');
        tdQ.style.cssText = 'padding: 10px 8px 10px 0; font-size: 13px; font-weight: 500; color: var(--c-text);';
        tdQ.textContent = reviewText('question_number', 'Question #{id}', { id: item.question_id });
        tr.appendChild(tdQ);

        if (showCertification) {
            const tdCert = document.createElement('td');
            tdCert.style.cssText = 'padding: 10px 8px 10px 0;';
            const certBadge = document.createElement('span');
            certBadge.style.cssText = 'font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 6px; background: var(--c-primary-muted); color: var(--c-primary); white-space: nowrap;';
            certBadge.textContent = item.certification_code || '—';
            tdCert.appendChild(certBadge);
            tr.appendChild(tdCert);
        }

        // Source badge
        const tdSource = document.createElement('td');
        tdSource.style.cssText = 'padding: 10px 8px 10px 0;';
        const badge = document.createElement('span');
        badge.style.cssText = 'font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 6px;';
        if (item.source === 'manual_bookmark') {
            badge.textContent = reviewText('source_bookmark', 'Bookmarked');
            badge.style.background = 'var(--c-warning-muted)';
            badge.style.color = 'var(--c-warning)';
        } else if (item.source === 'learning_error') {
            badge.textContent = reviewText('source_learning', 'Learning');
            badge.style.background = 'var(--c-danger-muted)';
            badge.style.color = 'var(--c-danger)';
        } else {
            badge.textContent = reviewText('source_mock', 'Mock Exam');
            badge.style.background = 'var(--c-danger-muted)';
            badge.style.color = 'var(--c-danger)';
        }
        tdSource.appendChild(badge);
        tr.appendChild(tdSource);

        // Times failed
        const tdFailed = document.createElement('td');
        tdFailed.style.cssText = 'padding: 10px 8px 10px 0; font-size: 13px; font-weight: 600; font-family: "JetBrains Mono", monospace; color: var(--c-danger);';
        tdFailed.textContent = item.times_failed;
        tr.appendChild(tdFailed);

        // Date added
        const tdDate = document.createElement('td');
        tdDate.style.cssText = 'padding: 10px 8px 10px 0; font-size: 12px; color: var(--c-text-muted);';
        tdDate.textContent = formatDate(item.added_at);
        tr.appendChild(tdDate);

        // Actions
        const tdAction = document.createElement('td');
        tdAction.style.cssText = 'padding: 10px 0; text-align: right;';
        const resolveBtn = document.createElement('button');
        resolveBtn.className = 'btn btn-ghost btn-sm';
        resolveBtn.textContent = reviewText('resolve', 'Resolve');
        resolveBtn.onclick = () => resolveItem(item.id);
        tdAction.appendChild(resolveBtn);
        tr.appendChild(tdAction);

        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

async function resolveItem(itemId) {
    try {
        await api('/analytics/review-pool/resolve/' + itemId, { method: 'POST', body: {} });
        reviewPoolData = null;
        reviewPoolPromise = null;
        // Remove the row with a fade effect
        const row = document.getElementById('review-row-' + itemId);
        if (row) {
            row.style.transition = 'opacity 0.3s';
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                // Update counts
                loadReviewPool();
            }, 300);
        }
    } catch (e) {
        console.error('Failed to resolve item:', e);
    }
}
