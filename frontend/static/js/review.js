/**
 * Review pool page — bookmarked and failed questions.
 * Safe DOM construction (no innerHTML).
 */

document.addEventListener('DOMContentLoaded', loadReviewPool);

async function loadReviewPool() {
    try {
        const data = await api('/analytics/review-pool');

        const total = data.total || 0;
        const items = data.items || [];
        const bookmarks = items.filter(i => i.source === 'manual_bookmark').length;
        const examErrors = items.filter(i => i.source === 'mock_exam_error' || i.source === 'learning_error').length;

        document.getElementById('review-total').textContent = total;
        document.getElementById('review-bookmarks').textContent = bookmarks;
        document.getElementById('review-exams').textContent = examErrors;

        // Disable start button if empty
        if (total === 0) {
            document.getElementById('btn-start-review').disabled = true;
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
        title.textContent = 'Review pool is empty';
        empty.appendChild(title);

        const hint = document.createElement('p');
        hint.style.cssText = 'font-size: 13px;';
        hint.textContent = 'Questions you bookmark or answer incorrectly in mock exams will appear here.';
        empty.appendChild(hint);

        container.appendChild(empty);
        return;
    }

    // Table
    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse;';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.cssText = 'border-bottom: 1px solid var(--c-border);';
    ['Question', 'Source', 'Failed', 'Added', ''].forEach(text => {
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
        tdQ.textContent = 'Question #' + item.question_id;
        tr.appendChild(tdQ);

        // Source badge
        const tdSource = document.createElement('td');
        tdSource.style.cssText = 'padding: 10px 8px 10px 0;';
        const badge = document.createElement('span');
        badge.style.cssText = 'font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 6px;';
        if (item.source === 'manual_bookmark') {
            badge.textContent = 'Bookmark';
            badge.style.background = 'var(--c-warning-muted)';
            badge.style.color = 'var(--c-warning)';
        } else if (item.source === 'learning_error') {
            badge.textContent = 'Learning';
            badge.style.background = 'var(--c-danger-muted)';
            badge.style.color = 'var(--c-danger)';
        } else {
            badge.textContent = 'Mock Exam';
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
        resolveBtn.textContent = 'Resolve';
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
