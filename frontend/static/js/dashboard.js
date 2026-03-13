/**
 * Dashboard — readiness gauge, domain mastery, streak, quick actions, recent sessions.
 * Consumes GET /api/analytics/dashboard
 */

let _resumeSessionId = null;
let _resumeMode = null;

document.addEventListener('DOMContentLoaded', async () => {
    const certificationCode = getActiveCertificationCode();
    const query = certificationCode ? `?certification_code=${encodeURIComponent(certificationCode)}` : '';
    const [dashData, resumeData] = await Promise.all([
        api(`/analytics/dashboard${query}`).catch(() => null),
        api(`/exam/resume${query}`).catch(() => null),
    ]);

    // ── Resume banner ──
    if (resumeData?.has_active_session) {
        _resumeSessionId = resumeData.session_id;
        _resumeMode = resumeData.mode;
        const banner = document.getElementById('resume-banner');
        banner.style.display = 'block';

        const modeLabel = resumeData.mode === 'mock_exam' ? (t('dashboard.mode_mock_exam') || 'Mock Exam')
            : resumeData.mode === 'learning' ? (t('dashboard.mode_learning') || 'Learning Session')
            : (t('dashboard.mode_review') || 'Review Session');
        const detail = `${modeLabel} — ${resumeData.answered}/${resumeData.total_questions} answered — Question ${resumeData.current_index + 1}`;
        document.getElementById('resume-detail').textContent = detail;
    }

    if (!dashData) return;

    renderGauge(dashData.readiness);

    document.getElementById('streak-count').textContent = dashData.streak.current;
    document.getElementById('streak-longest').textContent = (t('dashboard.longest_prefix') || 'Longest: ') + dashData.streak.longest;
    document.getElementById('today-answered').textContent = dashData.today_answered;
    document.getElementById('due-reviews').textContent = dashData.due_reviews;
    document.getElementById('review-due-count').textContent = dashData.due_reviews;
    document.getElementById('total-questions-badge').textContent = t('dashboard.questions_label', { count: dashData.total_questions }) || (dashData.total_questions + ' questions');
    setCertificationActionsEnabled(dashData.total_questions > 0);

    renderDomains(dashData.domains);
    renderRecentSessions(dashData.recent_sessions);
});

function setCertificationActionsEnabled(enabled) {
    ['qa-learn', 'qa-mock', 'qa-weak', 'qa-review'].forEach(id => {
        const button = document.getElementById(id);
        if (!button) return;
        button.disabled = !enabled;
        button.title = enabled ? '' : 'No certification content available yet';
    });
}


// ── Readiness Gauge ──────────────────────────────

function renderGauge(pct) {
    const el = document.getElementById('readiness-pct');
    const ring = document.getElementById('readiness-ring');
    const badge = document.getElementById('readiness-badge');

    animateValue(el, 0, pct, 1200);

    // circumference = 2 * PI * 76 ≈ 477.5
    const circumference = 477.5;
    const offset = circumference - (pct / 100) * circumference;
    requestAnimationFrame(() => {
        ring.style.strokeDashoffset = offset;
    });

    if (pct >= 70) {
        ring.style.stroke = 'var(--c-success)';
        badge.textContent = t('dashboard.readiness_exam_ready') || 'Exam Ready';
        badge.className = 'badge badge-success';
    } else if (pct >= 50) {
        ring.style.stroke = 'var(--c-warning)';
        badge.textContent = t('dashboard.readiness_almost') || 'Almost Ready';
        badge.className = 'badge badge-warning';
    } else if (pct > 0) {
        ring.style.stroke = 'var(--c-danger)';
        badge.textContent = t('dashboard.readiness_needs_practice') || 'Needs Practice';
        badge.className = 'badge badge-danger';
    } else {
        badge.textContent = t('dashboard.readiness_not_started') || 'Not Started';
        badge.className = 'badge badge-domain';
    }
}

function animateValue(el, start, end, duration) {
    const range = end - start;
    if (range === 0) { el.textContent = end + '%'; return; }
    const startTime = performance.now();
    function step(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + range * eased) + '%';
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}


// ── Domain Cards (safe DOM construction) ─────────

function renderDomains(domains) {
    const grid = document.getElementById('domain-grid');
    grid.textContent = '';

    domains.forEach(d => {
        const card = document.createElement('div');
        card.className = 'domain-card card-hover';
        card.onclick = () => startLearning('learning_domain', d.domain_id);

        const total = d.total_questions;
        const bc = d.box_counts;
        const masteredPct = total > 0 ? Math.round(bc.mastered / total * 100) : 0;
        const learningPct = total > 0 ? Math.round(bc.learning / total * 100) : 0;
        const newPct = total > 0 ? Math.round(bc.new_wrong / total * 100) : 0;
        const unseenPct = total > 0 ? Math.max(0, 100 - masteredPct - learningPct - newPct) : 100;

        // Domain name
        const nameEl = document.createElement('div');
        nameEl.className = 'domain-name';
        nameEl.textContent = d.domain_name;
        card.appendChild(nameEl);

        // Weight
        const weightEl = document.createElement('div');
        weightEl.className = 'domain-weight';
        weightEl.textContent = d.weight_min + '–' + d.weight_max + '% ' + (t('dashboard.of_exam') || 'of exam');
        card.appendChild(weightEl);

        // Mastery percentage
        const pctEl = document.createElement('div');
        pctEl.className = 'domain-pct';
        pctEl.textContent = d.mastery_pct + '%';
        if (d.mastery_pct >= 70) pctEl.style.color = 'var(--c-success)';
        else if (d.mastery_pct >= 50) pctEl.style.color = 'var(--c-warning)';
        card.appendChild(pctEl);

        // Progress bar
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.style.height = '6px';
        const fill = document.createElement('div');
        fill.className = 'progress-fill ' + getProgressClass(d.mastery_pct);
        fill.style.width = d.mastery_pct + '%';
        bar.appendChild(fill);
        card.appendChild(bar);

        // Box segments (stacked bar)
        const boxRow = document.createElement('div');
        boxRow.className = 'domain-boxes';
        boxRow.style.marginTop = '10px';
        const segments = [
            { pct: masteredPct, cls: 'box-mastered' },
            { pct: learningPct, cls: 'box-learning' },
            { pct: newPct, cls: 'box-new' },
            { pct: unseenPct, cls: 'box-unseen' },
        ];
        segments.forEach(seg => {
            if (seg.pct > 0) {
                const s = document.createElement('div');
                s.className = 'box-segment ' + seg.cls;
                s.style.width = seg.pct + '%';
                boxRow.appendChild(s);
            }
        });
        card.appendChild(boxRow);

        // Stats legend
        const statsRow = document.createElement('div');
        statsRow.className = 'domain-stats';
        const legend = [
            { color: 'var(--c-success)', label: bc.mastered + ' ' + (t('dashboard.mastered') || 'mastered') },
            { color: 'var(--c-warning)', label: bc.learning + ' ' + (t('dashboard.learning_label') || 'learning') },
            { color: 'var(--c-danger)', label: bc.new_wrong + ' ' + (t('dashboard.weak') || 'weak') },
            { color: 'var(--c-border)', label: bc.unseen + ' ' + (t('dashboard.unseen') || 'unseen') },
        ];
        legend.forEach(item => {
            const span = document.createElement('span');
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.style.background = item.color;
            span.appendChild(dot);
            span.appendChild(document.createTextNode(' ' + item.label));
            statsRow.appendChild(span);
        });
        card.appendChild(statsRow);

        grid.appendChild(card);
    });
}


// ── Recent Sessions (safe DOM) ───────────────────

function renderRecentSessions(sessions) {
    const container = document.getElementById('recent-sessions');
    if (!sessions || sessions.length === 0) return;

    container.textContent = '';

    sessions.forEach(s => {
        const row = document.createElement('div');
        row.className = 'session-row';

        const isExam = s.mode === 'mock_exam';
        const modeClass = isExam ? 'mock' : s.mode.includes('review') ? 'review' : 'learning';
        const modeLabel = isExam ? (t('dashboard.mode_mock_exam') || 'Mock Exam') : s.mode === 'review_pool' ? (t('dashboard.mode_review') || 'Review') : (t('dashboard.mode_learning') || 'Learning');
        const scorePct = s.total > 0 ? Math.round(s.correct / s.total * 100) : 0;
        const barColor = scorePct >= 70 ? 'var(--c-success)' : scorePct >= 50 ? 'var(--c-warning)' : 'var(--c-danger)';

        if (isExam) {
            row.onclick = () => { window.location.href = '/mock-exams/results/' + s.session_id; };
        } else {
            row.style.cursor = 'default';
        }

        // Mode badge
        const modeEl = document.createElement('span');
        modeEl.className = 'session-mode ' + modeClass;
        modeEl.textContent = modeLabel;
        row.appendChild(modeEl);

        // Score
        const scoreEl = document.createElement('span');
        scoreEl.className = 'session-score';
        scoreEl.style.color = barColor;
        scoreEl.textContent = s.correct + '/' + s.total;
        row.appendChild(scoreEl);

        // Bar
        const barWrapper = document.createElement('div');
        barWrapper.className = 'session-bar';
        const barFill = document.createElement('div');
        barFill.className = 'session-bar-fill';
        barFill.style.width = scorePct + '%';
        barFill.style.background = barColor;
        barWrapper.appendChild(barFill);
        row.appendChild(barWrapper);

        // Date
        const dateEl = document.createElement('span');
        dateEl.className = 'session-date';
        dateEl.textContent = formatDate(s.completed_at);
        row.appendChild(dateEl);

        container.appendChild(row);
    });
}


// ── Resume helpers ───────────────────────────────

function resumeSession() {
    if (!_resumeSessionId) return;
    if (_resumeMode === 'mock_exam') {
        window.location.href = '/mock-exams/session/' + _resumeSessionId;
    } else {
        window.location.href = '/learn/session/' + _resumeSessionId;
    }
}

function dismissResume() {
    document.getElementById('resume-banner').style.display = 'none';
}
