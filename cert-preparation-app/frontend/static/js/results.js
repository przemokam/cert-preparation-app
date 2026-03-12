/**
 * Results page — displays exam score, domain breakdown, and recommendations.
 * Uses safe DOM construction (no innerHTML).
 */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Complete the session and get results
        const results = await api('/exam/' + SESSION_ID + '/complete', { method: 'POST' });

        if (!results) return;

        renderScore(results.score, results.passed);
        renderSummaryStats(results.correct, results.incorrect, results.total_questions);
        renderDomainBreakdown(results.domains);
        loadRecommendations();
    } catch (e) {
        // Session may already be completed — try loading from history
        console.warn('Complete failed, loading from history:', e.message);
        loadFromHistory();
    }
});

async function loadFromHistory() {
    try {
        const data = await api('/exam/history');
        if (!data || !data.history) return;

        const session = data.history.find(h => h.session_id === SESSION_ID);
        if (!session) return;

        renderScore(session.score, session.passed);
        renderSummaryStats(session.correct, session.total_questions - session.correct, session.total_questions);

        // Load domain stats
        const stats = await api('/analytics/stats');
        if (stats && stats.domains) {
            renderDomainBreakdown(buildDomainObj(stats.domains));
        }
        loadRecommendations();
    } catch (e) {
        console.error('Failed to load results', e);
    }
}

function buildDomainObj(domains) {
    const obj = {};
    domains.forEach(d => {
        obj[d.domain_name] = {
            total: d.total,
            correct: d.correct,
            percentage: d.percentage,
        };
    });
    return obj;
}

function renderScore(score, passed) {
    // Animate score number
    const valueEl = document.getElementById('score-value-overlay');
    animateNumber(valueEl, 0, score, 1200);

    // Animate ring
    const arc = document.getElementById('score-arc');
    const circumference = 440;
    const offset = circumference - (score / 1000) * circumference;
    setTimeout(() => {
        arc.style.strokeDashoffset = offset;
        arc.style.stroke = passed ? 'var(--c-success)' : 'var(--c-danger)';
    }, 100);

    // Badge
    const badge = document.getElementById('result-badge');
    badge.textContent = passed ? 'PASSED' : 'FAILED';
    badge.style.background = passed ? 'var(--c-success-muted)' : 'var(--c-danger-muted)';
    badge.style.color = passed ? 'var(--c-success)' : 'var(--c-danger)';
    badge.style.border = '1px solid ' + (passed ? 'var(--c-success)' : 'var(--c-danger)');

    // Background glow effect
    const bg = document.getElementById('score-bg-effect');
    bg.style.background = passed
        ? 'radial-gradient(circle at 50% 0%, var(--c-success), transparent 70%)'
        : 'radial-gradient(circle at 50% 0%, var(--c-danger), transparent 70%)';
}

function renderSummaryStats(correct, incorrect, total) {
    const correctEl = document.getElementById('stat-correct');
    const incorrectEl = document.getElementById('stat-incorrect');
    const totalEl = document.getElementById('stat-total');

    animateNumber(correctEl, 0, correct, 800);
    animateNumber(incorrectEl, 0, incorrect, 800);
    animateNumber(totalEl, 0, total, 800);
}

function animateNumber(el, from, to, duration) {
    const start = performance.now();
    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(from + (to - from) * eased);
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function renderDomainBreakdown(domains) {
    const container = document.getElementById('domain-breakdown');
    container.textContent = '';

    if (!domains || typeof domains !== 'object') return;

    const entries = Object.entries(domains);
    entries.forEach(([name, data]) => {
        const pct = data.percentage || 0;

        const row = document.createElement('div');
        row.style.cssText = 'margin-bottom: 16px;';

        // Label row
        const labelRow = document.createElement('div');
        labelRow.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 6px;';

        const nameEl = document.createElement('span');
        nameEl.style.cssText = 'font-size: 13px; font-weight: 500; color: var(--c-text);';
        nameEl.textContent = name;
        labelRow.appendChild(nameEl);

        const statsEl = document.createElement('span');
        statsEl.style.cssText = 'font-size: 13px; font-family: "JetBrains Mono", monospace;';
        statsEl.textContent = pct + '% (' + data.correct + '/' + data.total + ')';
        statsEl.style.color = pct >= 70 ? 'var(--c-success)' : pct >= 50 ? 'var(--c-warning)' : 'var(--c-danger)';
        labelRow.appendChild(statsEl);

        row.appendChild(labelRow);

        // Progress bar
        const barOuter = document.createElement('div');
        barOuter.className = 'progress-bar';

        const barFill = document.createElement('div');
        barFill.className = 'progress-fill';
        barFill.style.width = '0%';
        barFill.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
        if (pct >= 70) barFill.style.background = 'var(--c-success)';
        else if (pct >= 50) barFill.style.background = 'var(--c-warning)';
        else barFill.style.background = 'var(--c-danger)';

        barOuter.appendChild(barFill);
        row.appendChild(barOuter);

        container.appendChild(row);

        // Animate bar
        setTimeout(() => { barFill.style.width = pct + '%'; }, 200);
    });
}

async function loadRecommendations() {
    const container = document.getElementById('recommendations');
    container.textContent = '';

    try {
        const data = await api('/analytics/weak-spots');
        if (!data || !data.weak_spots || data.weak_spots.length === 0) {
            const msg = document.createElement('p');
            msg.style.cssText = 'color: var(--c-text-muted); padding: 12px 0; font-size: 14px;';
            msg.textContent = 'All domains look strong! Keep up the good work.';
            container.appendChild(msg);
            return;
        }

        data.weak_spots.slice(0, 5).forEach(ws => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--c-border);';

            const left = document.createElement('div');
            left.style.cssText = 'display: flex; align-items: center; gap: 10px;';

            const badge = document.createElement('span');
            badge.style.cssText = 'font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; background: var(--c-danger-muted); color: var(--c-danger);';
            badge.textContent = ws.error_rate + '% errors';
            left.appendChild(badge);

            const nameSpan = document.createElement('span');
            nameSpan.style.cssText = 'font-size: 13px; font-weight: 500; color: var(--c-text);';
            nameSpan.textContent = ws.skill_name;
            left.appendChild(nameSpan);

            const domainSpan = document.createElement('span');
            domainSpan.style.cssText = 'font-size: 12px; color: var(--c-text-muted);';
            domainSpan.textContent = ws.domain;
            left.appendChild(domainSpan);

            row.appendChild(left);

            const btn = document.createElement('button');
            btn.className = 'btn btn-outline btn-sm';
            btn.textContent = 'Practice';
            btn.onclick = () => startLearning('weak_spots');
            row.appendChild(btn);

            container.appendChild(row);
        });
    } catch (e) {
        const msg = document.createElement('p');
        msg.style.cssText = 'color: var(--c-text-muted); font-size: 13px;';
        msg.textContent = 'Could not load recommendations.';
        container.appendChild(msg);
    }
}
