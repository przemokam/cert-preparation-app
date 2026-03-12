/**
 * Statistics page — mastery, accuracy, weak spots, exam history.
 * All DOM construction is safe (no innerHTML).
 */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [stats, mastery, streak, weakSpots, history] = await Promise.all([
            api('/analytics/stats'),
            api('/analytics/mastery'),
            api('/analytics/streak'),
            api('/analytics/weak-spots'),
            api('/exam/history'),
        ]);

        renderSummaryCards(stats, streak);
        renderMasteryDomains(mastery);
        renderDomainAccuracy(stats);
        renderWeakSpots(weakSpots);
        renderExamHistory(history);
    } catch (e) {
        console.error('Failed to load statistics:', e);
    }
});


function renderSummaryCards(stats, streak) {
    document.getElementById('stat-total-answered').textContent = stats.total_answered || 0;
    document.getElementById('stat-accuracy').textContent = (stats.accuracy || 0) + '%';
    document.getElementById('stat-streak').textContent = streak.current || 0;
    document.getElementById('stat-study-days').textContent = streak.total_days || 0;
}


function renderMasteryDomains(mastery) {
    const container = document.getElementById('mastery-domains');
    container.textContent = '';

    if (!mastery || !mastery.domains) return;

    mastery.domains.forEach(domain => {
        const boxes = domain.boxes; // [unseen, wrong, shaky, learning, known, mastered]
        const total = domain.total || 1;

        const row = document.createElement('div');
        row.style.cssText = 'margin-bottom: 20px;';

        // Label
        const label = document.createElement('div');
        label.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 6px;';

        const nameEl = document.createElement('span');
        nameEl.style.cssText = 'font-size: 13px; font-weight: 500; color: var(--c-text);';
        nameEl.textContent = domain.domain_name;
        label.appendChild(nameEl);

        const countEl = document.createElement('span');
        countEl.style.cssText = 'font-size: 12px; font-family: "JetBrains Mono", monospace; color: var(--c-text-muted);';
        const mastered = (boxes[4] || 0) + (boxes[5] || 0);
        countEl.textContent = mastered + '/' + total + ' mastered';
        label.appendChild(countEl);

        row.appendChild(label);

        // Stacked bar
        const bar = document.createElement('div');
        bar.style.cssText = 'display: flex; height: 8px; border-radius: 4px; overflow: hidden; background: var(--c-border);';

        const segments = [
            { count: boxes[0] || 0, color: 'var(--c-border)', label: 'Unseen' },
            { count: boxes[1] || 0, color: 'var(--c-danger)', label: 'Wrong' },
            { count: (boxes[2] || 0) + (boxes[3] || 0), color: 'var(--c-warning)', label: 'Learning' },
            { count: (boxes[4] || 0) + (boxes[5] || 0), color: 'var(--c-success)', label: 'Mastered' },
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

        const boxLabels = ['Unseen', 'New/Wrong', 'Shaky', 'Learning', 'Known', 'Mastered'];
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
        msg.textContent = 'No answers yet. Start practicing to see your accuracy.';
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
        name.style.cssText = 'font-size: 13px; font-weight: 500; color: var(--c-text);';
        name.textContent = d.domain_name;
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
        weight.textContent = 'Exam weight: ' + d.weight_min + '-' + d.weight_max + '%';
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
        msg.textContent = 'No weak spots detected. Great job!';
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
        badge.textContent = ws.error_rate + '% errors';
        left.appendChild(badge);

        const nameSpan = document.createElement('span');
        nameSpan.style.cssText = 'font-size: 13px; font-weight: 500; color: var(--c-text);';
        nameSpan.textContent = ws.skill_name;
        left.appendChild(nameSpan);

        const domainSpan = document.createElement('span');
        domainSpan.style.cssText = 'font-size: 11px; color: var(--c-text-muted);';
        domainSpan.textContent = ws.domain;
        left.appendChild(domainSpan);

        const attemptsSpan = document.createElement('span');
        attemptsSpan.style.cssText = 'font-size: 11px; color: var(--c-text-muted);';
        attemptsSpan.textContent = ws.total_attempts + ' attempts';
        left.appendChild(attemptsSpan);

        row.appendChild(left);

        const btn = document.createElement('button');
        btn.className = 'btn btn-outline btn-sm';
        btn.textContent = 'Practice';
        btn.onclick = () => startLearning('learning_domain', ws.domain_id);
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
        msg.textContent = 'No mock exams completed yet.';
        container.appendChild(msg);
        return;
    }

    const mockExams = data.history.filter(h => h.mode === 'mock_exam');
    if (mockExams.length === 0) {
        const msg = document.createElement('p');
        msg.style.cssText = 'color: var(--c-text-muted); font-size: 13px;';
        msg.textContent = 'No mock exams completed yet. Take a mock exam to see your results here.';
        container.appendChild(msg);
        return;
    }

    // Readiness summary
    if (data.readiness) {
        const readiness = document.createElement('div');
        readiness.style.cssText = 'display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px 16px; background: var(--c-primary-muted); border-radius: 8px; border: 1px solid var(--c-primary);';

        const label = document.createElement('span');
        label.style.cssText = 'font-size: 13px; color: var(--c-text);';
        label.textContent = 'Exam Readiness: ';
        readiness.appendChild(label);

        const score = document.createElement('span');
        score.style.cssText = 'font-size: 18px; font-weight: 700; font-family: "JetBrains Mono", monospace; color: var(--c-primary);';
        score.textContent = data.readiness.score + '/1000';
        readiness.appendChild(score);

        const passInfo = document.createElement('span');
        passInfo.style.cssText = 'font-size: 12px; color: var(--c-text-muted); margin-left: auto;';
        passInfo.textContent = data.readiness.exams_passed + '/' + data.readiness.exams_total + ' exams passed';
        readiness.appendChild(passInfo);

        container.appendChild(readiness);
    }

    // Table
    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse;';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.cssText = 'border-bottom: 1px solid var(--c-border);';
    ['Date', 'Score', 'Result', 'Questions', ''].forEach(text => {
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
        badge.textContent = exam.passed ? 'Pass' : 'Fail';
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
        link.href = '/results/' + exam.session_id;
        link.className = 'btn btn-ghost btn-sm';
        link.textContent = 'Details';
        tdAction.appendChild(link);
        tr.appendChild(tdAction);

        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}
