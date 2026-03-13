/**
 * Statistics page — mastery, accuracy, weak spots, exam history.
 * All DOM construction is safe (no innerHTML).
 */

let statsPageData = null;
let statsPagePromise = null;

function getStatsPage() {
    return document.getElementById('stats-page');
}

function getStatsScope() {
    return getStatsPage()?.dataset?.scope === 'active' ? 'active' : 'all';
}

function isStatsScopeActive() {
    return getStatsScope() === 'active';
}

function statsQuerySuffix() {
    const certificationCode = isStatsScopeActive() ? getActiveCertificationCode() : '';
    return certificationCode ? `?certification_code=${encodeURIComponent(certificationCode)}` : '';
}

function appendCertificationBadge(parent, certificationCode) {
    if (!certificationCode) return;
    const badge = document.createElement('span');
    badge.style.cssText = 'font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: var(--c-primary-muted); color: var(--c-primary); white-space: nowrap;';
    badge.textContent = certificationCode;
    parent.appendChild(badge);
}

function applyStatsScopeCopy() {
    const activeScope = isStatsScopeActive();
    const subtitle = document.getElementById('stats-subtitle');
    const scopeNote = document.getElementById('stats-scope-note');
    const streakLabel = document.getElementById('stat-label-streak');
    const studyDaysLabel = document.getElementById('stat-label-study-days');

    if (subtitle) {
        subtitle.textContent = activeScope
            ? statsText('subtitle_active', 'Track progress for your active certification')
            : statsText('subtitle_all', 'Track your progress across all certifications');
    }

    if (scopeNote) {
        scopeNote.textContent = activeScope
            ? statsText('scope_note_active', 'Performance, weak spots, and exam history are filtered to this certification. Habit metrics remain global.')
            : statsText('scope_note_all', 'Cross-cert performance is combined here. Switch to This Certification to launch scoped practice actions.');
    }

    if (streakLabel) {
        streakLabel.textContent = activeScope
            ? statsText('day_streak_all', 'All-Cert Streak')
            : statsText('day_streak', 'Day Streak');
    }

    if (studyDaysLabel) {
        studyDaysLabel.textContent = activeScope
            ? statsText('study_days_all', 'All-Cert Study Days')
            : statsText('study_days', 'Study Days');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (Object.keys(I18N.translations || {}).length > 0) {
        initStatsPage();
    }
});

document.addEventListener('i18n:ready', initStatsPage);

function statsText(key, fallback, params) {
    return t(`stats.${key}`, params) || fallback;
}

async function ensureStatsPageData() {
    if (statsPageData) return statsPageData;
    if (!statsPagePromise) {
        const query = statsQuerySuffix();
        statsPagePromise = Promise.all([
            api('/analytics/stats' + query),
            api('/analytics/mastery' + query),
            api('/analytics/streak'),
            api('/analytics/weak-spots' + query),
            api('/exam/history' + query),
        ]).then(([stats, mastery, streak, weakSpots, history]) => {
            statsPageData = { stats, mastery, streak, weakSpots, history };
            return statsPageData;
        });
    }
    return statsPagePromise;
}

async function initStatsPage() {
    try {
        applyStatsScopeCopy();
        const data = await ensureStatsPageData();
        renderSummaryCards(data.stats, data.streak);
        renderMasteryDomains(data.mastery);
        renderDomainAccuracy(data.stats);
        renderWeakSpots(data.weakSpots);
        renderExamHistory(data.history);
    } catch (e) {
        console.error('Failed to load statistics:', e);
    }
}


function renderSummaryCards(stats, streak) {
    document.getElementById('stat-total-answered').textContent = stats.total_answered || 0;
    document.getElementById('stat-accuracy').textContent = (stats.accuracy || 0) + '%';
    document.getElementById('stat-streak').textContent = streak.current || 0;
    document.getElementById('stat-study-days').textContent = streak.total_days || 0;
}


function renderMasteryDomains(mastery) {
    const container = document.getElementById('mastery-domains');
    container.textContent = '';

    if (!mastery || !mastery.domains || mastery.domains.length === 0) {
        const msg = document.createElement('p');
        msg.style.cssText = 'color: var(--c-text-muted); font-size: 13px;';
        msg.textContent = isStatsScopeActive()
            ? statsText('no_mastery_active', 'No mastery data for this certification yet.')
            : statsText('no_mastery_all', 'No mastery data available yet.');
        container.appendChild(msg);
        return;
    }

    mastery.domains.forEach(domain => {
        const boxes = domain.boxes; // [unseen, wrong, shaky, learning, known, mastered]
        const total = domain.total || 1;

        const row = document.createElement('div');
        row.style.cssText = 'margin-bottom: 20px;';

        // Label
        const label = document.createElement('div');
        label.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 6px;';

        const nameEl = document.createElement('span');
        nameEl.style.cssText = 'display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; font-weight: 500; color: var(--c-text);';
        nameEl.textContent = domain.domain_name;
        if (!isStatsScopeActive()) appendCertificationBadge(nameEl, domain.certification_code);
        label.appendChild(nameEl);

        const countEl = document.createElement('span');
        countEl.style.cssText = 'font-size: 12px; font-family: "JetBrains Mono", monospace; color: var(--c-text-muted);';
        const mastered = (boxes[4] || 0) + (boxes[5] || 0);
        countEl.textContent = statsText('mastered_count', `${mastered}/${total} mastered`, { count: mastered, total });
        label.appendChild(countEl);

        row.appendChild(label);

        // Stacked bar
        const bar = document.createElement('div');
        bar.style.cssText = 'display: flex; height: 8px; border-radius: 4px; overflow: hidden; background: var(--c-border);';

        const segments = [
            { count: boxes[0] || 0, color: 'var(--c-border)', label: statsText('legend_unseen', 'Unseen') },
            { count: boxes[1] || 0, color: 'var(--c-danger)', label: statsText('legend_wrong', 'Wrong') },
            { count: (boxes[2] || 0) + (boxes[3] || 0), color: 'var(--c-warning)', label: statsText('legend_learning', 'Learning') },
            { count: (boxes[4] || 0) + (boxes[5] || 0), color: 'var(--c-success)', label: statsText('legend_mastered', 'Mastered') },
        ];

        segments.forEach(seg => {
            if (seg.count <= 0) return;
            const part = document.createElement('div');
            const pct = (seg.count / total) * 100;
            part.style.cssText = 'width: ' + pct + '%; background: ' + seg.color + '; transition: width 0.8s ease;';
            part.title = seg.label + ': ' + seg.count;
            bar.appendChild(part);
        });

        row.appendChild(bar);

        // Box detail
        const detail = document.createElement('div');
        detail.style.cssText = 'display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap;';

        const boxLabels = [
            statsText('box_unseen', 'Unseen'),
            statsText('box_new_wrong', 'New/Wrong'),
            statsText('box_shaky', 'Shaky'),
            statsText('box_learning', 'Learning'),
            statsText('box_known', 'Known'),
            statsText('box_mastered', 'Mastered'),
        ];
        boxes.forEach((count, i) => {
            if (count <= 0) return;
            const chip = document.createElement('span');
            chip.style.cssText = 'font-size: 10px; color: var(--c-text-muted);';
            chip.textContent = boxLabels[i] + ': ' + count;
            detail.appendChild(chip);
        });

        row.appendChild(detail);
        container.appendChild(row);
    });
}


function renderDomainAccuracy(stats) {
    const container = document.getElementById('domain-accuracy');
    container.textContent = '';

    if (!stats || !stats.domains || stats.domains.length === 0) {
        const msg = document.createElement('p');
        msg.style.cssText = 'color: var(--c-text-muted); font-size: 13px;';
        msg.textContent = isStatsScopeActive()
            ? statsText('no_answers_yet_active', 'No answers yet for this certification. Start practicing to see your accuracy.')
            : statsText('no_answers_yet', 'No answers yet. Start practicing to see your accuracy.');
        container.appendChild(msg);
        return;
    }

    stats.domains.forEach(d => {
        const pct = d.percentage || 0;
        const row = document.createElement('div');
        row.style.cssText = 'margin-bottom: 16px;';

        const labelRow = document.createElement('div');
        labelRow.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 6px;';

        const name = document.createElement('span');
        name.style.cssText = 'display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; font-weight: 500; color: var(--c-text);';
        name.textContent = d.domain_name;
        if (!isStatsScopeActive()) appendCertificationBadge(name, d.certification_code);
        labelRow.appendChild(name);

        const valSpan = document.createElement('span');
        valSpan.style.cssText = 'font-size: 13px; font-family: "JetBrains Mono", monospace;';
        valSpan.textContent = pct + '% (' + d.correct + '/' + d.total + ')';
        valSpan.style.color = pct >= 70 ? 'var(--c-success)' : pct >= 50 ? 'var(--c-warning)' : 'var(--c-danger)';
        labelRow.appendChild(valSpan);

        row.appendChild(labelRow);

        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        const fill = document.createElement('div');
        fill.className = 'progress-fill';
        fill.style.width = pct + '%';
        if (pct >= 70) fill.style.background = 'var(--c-success)';
        else if (pct >= 50) fill.style.background = 'var(--c-warning)';
        else fill.style.background = 'var(--c-danger)';
        bar.appendChild(fill);
        row.appendChild(bar);

        // Weight badge
        const weight = document.createElement('div');
        weight.style.cssText = 'font-size: 10px; color: var(--c-text-muted); margin-top: 2px;';
        weight.textContent = statsText('exam_weight', `Exam weight: ${d.weight_min}-${d.weight_max}%`, { min: d.weight_min, max: d.weight_max });
        row.appendChild(weight);

        container.appendChild(row);
    });
}


function renderWeakSpots(data) {
    const container = document.getElementById('weak-spots');
    container.textContent = '';

    if (!data || !data.weak_spots || data.weak_spots.length === 0) {
        const msg = document.createElement('p');
        msg.style.cssText = 'color: var(--c-text-muted); font-size: 13px;';
        msg.textContent = isStatsScopeActive()
            ? statsText('no_weak_spots_active', 'No weak spots detected for this certification. Great job!')
            : statsText('no_weak_spots', 'No weak spots detected. Great job!');
        container.appendChild(msg);
        return;
    }

    data.weak_spots.forEach(ws => {
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--c-border);';

        const left = document.createElement('div');
        left.style.cssText = 'display: flex; align-items: center; gap: 10px; flex-wrap: wrap;';

        const badge = document.createElement('span');
        badge.style.cssText = 'font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; background: var(--c-danger-muted); color: var(--c-danger); white-space: nowrap;';
        badge.textContent = statsText('error_rate', `${ws.error_rate}% errors`, { rate: ws.error_rate });
        left.appendChild(badge);

        const nameSpan = document.createElement('span');
        nameSpan.style.cssText = 'font-size: 13px; font-weight: 500; color: var(--c-text);';
        nameSpan.textContent = ws.skill_name;
        left.appendChild(nameSpan);

        const domainSpan = document.createElement('span');
        domainSpan.style.cssText = 'font-size: 11px; color: var(--c-text-muted);';
        domainSpan.textContent = !isStatsScopeActive() && ws.certification_code
            ? `${ws.domain} · ${ws.certification_code}`
            : ws.domain;
        left.appendChild(domainSpan);

        const attemptsSpan = document.createElement('span');
        attemptsSpan.style.cssText = 'font-size: 11px; color: var(--c-text-muted);';
        attemptsSpan.textContent = statsText('attempts', `${ws.total_attempts} attempts`, { count: ws.total_attempts });
        left.appendChild(attemptsSpan);

        row.appendChild(left);

        const btn = document.createElement('button');
        btn.className = 'btn btn-outline btn-sm';
        if (isStatsScopeActive()) {
            btn.textContent = statsText('practice_btn', 'Practice');
            btn.onclick = () => startLearning('learning_domain', ws.domain_id);
        } else {
            btn.textContent = statsText('practice_scope_only', 'Switch scope to practice');
            btn.disabled = true;
            btn.title = statsText('practice_scope_only_hint', 'Weak-spot practice launches from the active certification scope.');
        }
        row.appendChild(btn);

        container.appendChild(row);
    });
}


function renderExamHistory(data) {
    const container = document.getElementById('exam-history');
    container.textContent = '';

    if (!data || !data.history) {
        const msg = document.createElement('p');
        msg.style.cssText = 'color: var(--c-text-muted); font-size: 13px;';
        msg.textContent = statsText('no_exams', 'No mock exams completed yet.');
        container.appendChild(msg);
        return;
    }

    const mockExams = data.history.filter(h => h.mode === 'mock_exam');
    if (mockExams.length === 0) {
        const msg = document.createElement('p');
        msg.style.cssText = 'color: var(--c-text-muted); font-size: 13px;';
        msg.textContent = isStatsScopeActive()
            ? statsText('no_exams_detailed_active', 'No mock exams completed for this certification yet. Take one to see your results here.')
            : statsText('no_exams_detailed', 'No mock exams completed yet. Take a mock exam to see your results here.');
        container.appendChild(msg);
        return;
    }

    // Readiness summary
    if (data.readiness) {
        const readiness = document.createElement('div');
        readiness.style.cssText = 'display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px 16px; background: var(--c-primary-muted); border-radius: 8px; border: 1px solid var(--c-primary);';

        const label = document.createElement('span');
        label.style.cssText = 'font-size: 13px; color: var(--c-text);';
        label.textContent = statsText('exam_readiness', 'Exam Readiness: ');
        readiness.appendChild(label);

        const score = document.createElement('span');
        score.style.cssText = 'font-size: 18px; font-weight: 700; font-family: "JetBrains Mono", monospace; color: var(--c-primary);';
        score.textContent = data.readiness.score + '/1000';
        readiness.appendChild(score);

        const passInfo = document.createElement('span');
        passInfo.style.cssText = 'font-size: 12px; color: var(--c-text-muted); margin-left: auto;';
        passInfo.textContent = statsText('exams_passed_count', `${data.readiness.exams_passed}/${data.readiness.exams_total} exams passed`, { passed: data.readiness.exams_passed, total: data.readiness.exams_total });
        readiness.appendChild(passInfo);

        container.appendChild(readiness);
    }

    // Table
    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse;';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.cssText = 'border-bottom: 1px solid var(--c-border);';
    const headers = [
        statsText('date', 'Date'),
        ...(!isStatsScopeActive() ? [statsText('certification', 'Certification')] : []),
        statsText('score', 'Score'),
        statsText('result', 'Result'),
        statsText('questions', 'Questions'),
        ''
    ];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.style.cssText = 'text-align: left; padding: 8px 8px 8px 0; font-size: 11px; font-weight: 600; color: var(--c-text-muted); text-transform: uppercase; letter-spacing: 0.5px;';
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    mockExams.forEach(exam => {
        const tr = document.createElement('tr');
        tr.style.cssText = 'border-bottom: 1px solid var(--c-border);';

        // Date
        const tdDate = document.createElement('td');
        tdDate.style.cssText = 'padding: 10px 8px 10px 0; font-size: 13px; color: var(--c-text);';
        tdDate.textContent = formatDate(exam.completed_at);
        tr.appendChild(tdDate);

        if (!isStatsScopeActive()) {
            const tdCert = document.createElement('td');
            tdCert.style.cssText = 'padding: 10px 8px 10px 0;';
            const certBadge = document.createElement('span');
            certBadge.style.cssText = 'font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 6px; background: var(--c-primary-muted); color: var(--c-primary); white-space: nowrap;';
            certBadge.textContent = exam.certification_code || '—';
            tdCert.appendChild(certBadge);
            tr.appendChild(tdCert);
        }

        // Score
        const tdScore = document.createElement('td');
        tdScore.style.cssText = 'padding: 10px 8px 10px 0; font-size: 14px; font-weight: 600; font-family: "JetBrains Mono", monospace;';
        tdScore.textContent = exam.score + ' / 1000';
        tdScore.style.color = exam.passed ? 'var(--c-success)' : 'var(--c-danger)';
        tr.appendChild(tdScore);

        // Result badge
        const tdResult = document.createElement('td');
        tdResult.style.cssText = 'padding: 10px 8px 10px 0;';
        const badge = document.createElement('span');
        badge.style.cssText = 'font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 6px;';
        badge.textContent = exam.passed ? statsText('pass', 'Pass') : statsText('fail', 'Fail');
        badge.style.background = exam.passed ? 'var(--c-success-muted)' : 'var(--c-danger-muted)';
        badge.style.color = exam.passed ? 'var(--c-success)' : 'var(--c-danger)';
        tdResult.appendChild(badge);
        tr.appendChild(tdResult);

        // Questions
        const tdQ = document.createElement('td');
        tdQ.style.cssText = 'padding: 10px 8px 10px 0; font-size: 13px; color: var(--c-text-muted);';
        tdQ.textContent = exam.correct + '/' + exam.total_questions;
        tr.appendChild(tdQ);

        // Review link
        const tdAction = document.createElement('td');
        tdAction.style.cssText = 'padding: 10px 0; text-align: right;';
        const link = document.createElement('a');
        link.href = '/mock-exams/results/' + exam.session_id;
        link.className = 'btn btn-ghost btn-sm';
        link.textContent = statsText('details', 'Details');
        tdAction.appendChild(link);
        tr.appendChild(tdAction);

        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}
