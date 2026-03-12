/**
 * Mock Exam Controller — timed exam with no immediate feedback.
 * All 5 question types. Timer countdown. Submit at end.
 * Uses safe DOM construction (no innerHTML).
 */

// ── State ──────────────────────────────────────────────
var currentIndex = 0;
var totalQuestions = 0;
var currentQuestionId = null;
var currentQuestionType = null;
var answeredSet = new Set();
var flaggedSet = new Set();
var navPage = 0;
var questionStartTime = 0;
var csOpen = false;
var timerInterval = null;
var deadlineDate = null;
var NAV_PAGE_SIZE = 50;

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    // Start timer
    if (typeof DEADLINE !== 'undefined' && DEADLINE && DEADLINE !== 'None') {
        deadlineDate = new Date(DEADLINE);
        startTimer();
    }
    loadQuestion(0);
});

// ── Timer ──────────────────────────────────────────────
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

function updateTimerDisplay() {
    if (!deadlineDate) return;
    var now = new Date();
    var diff = deadlineDate - now;
    var timerEl = document.getElementById('exam-timer');
    var displayEl = document.getElementById('timer-display');

    if (diff <= 0) {
        clearInterval(timerInterval);
        displayEl.textContent = '00:00';
        timerEl.className = 'timer danger';
        // Auto-submit
        submitExam();
        return;
    }

    var hours = Math.floor(diff / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    var seconds = Math.floor((diff % 60000) / 1000);

    var parts = [];
    if (hours > 0) parts.push(String(hours).padStart(2, '0'));
    parts.push(String(minutes).padStart(2, '0'));
    parts.push(String(seconds).padStart(2, '0'));
    displayEl.textContent = parts.join(':');

    // Color based on time remaining
    var totalMinutes = diff / 60000;
    if (totalMinutes <= 5) {
        timerEl.className = 'timer danger';
    } else if (totalMinutes <= 15) {
        timerEl.className = 'timer warning';
    } else {
        timerEl.className = 'timer';
    }
}


// ── Load Question ──────────────────────────────────────
async function loadQuestion(index) {
    questionStartTime = Date.now();
    var data = await api('/exam/' + SESSION_ID + '/question/' + index);
    if (!data) return;
    if (data._expired) {
        alert('Time expired! Your exam has been submitted.');
        window.location.href = '/results/' + SESSION_ID;
        return;
    }

    currentIndex = data.index;
    totalQuestions = data.total;
    currentQuestionId = data.question_id;
    currentQuestionType = data.question_type;

    // Header
    document.getElementById('question-counter').textContent =
        'Question ' + (index + 1) + ' of ' + totalQuestions;

    // Case study
    handleCaseStudy(data.case_study);

    // Question text
    var textEl = document.getElementById('question-text');
    textEl.textContent = '';
    var inlineDropdownSlots = null;
    if (data.question_type === 'dropdown') {
        inlineDropdownSlots = {};
        renderMarkdownSafe(data.question_text, textEl, {
            dropdownSlots: data.interactive_data ? data.interactive_data.slots : [],
            renderedDropdownSlots: inlineDropdownSlots,
            createDropdownControl: function(slot, idx) {
                return buildDropdownSlotControl(slot, idx, true);
            },
        });
    } else {
        renderMarkdownSafe(data.question_text, textEl);
    }

    // Interactive area
    var interactive = document.getElementById('question-interactive');
    interactive.textContent = '';

    // Submit button
    var submitBtn = document.getElementById('btn-submit-answer');
    if (data.answered) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saved';
    } else {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Save Answer';
    }

    // Render by type
    if (data.question_type === 'single_choice') {
        renderSingleChoice(interactive, data.options || []);
    } else if (data.question_type === 'multi_choice') {
        renderMultiChoice(interactive, data.options || []);
    } else if (data.question_type === 'yes_no_grid') {
        renderYesNoGrid(interactive, data.interactive_data);
    } else if (data.question_type === 'dropdown') {
        renderDropdown(interactive, data.interactive_data, inlineDropdownSlots);
    } else if (data.question_type === 'drag_drop') {
        renderDragDrop(interactive, data.interactive_data);
    }

    // Restore previous answer if exists
    if (data.answered && data.user_response) {
        answeredSet.add(index);
        restoreUserResponse(data.user_response);
    }

    updateNavigator();
    updateProgressBar();
    updateNavButtons();

    // Flag button state
    var flagBtn = document.getElementById('btn-flag');
    if (flaggedSet.has(currentIndex)) {
        flagBtn.style.borderColor = 'var(--c-warning)';
        flagBtn.style.color = 'var(--c-warning-text)';
    } else {
        flagBtn.style.borderColor = '';
        flagBtn.style.color = '';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ── Question Renderers (same as learning but simplified) ──

function renderSingleChoice(container, options) {
    var list = document.createElement('div');
    list.className = 'option-list';
    options.forEach(function(opt) {
        var letter = opt.charAt(0);
        var text = opt.substring(3).trim();
        var item = document.createElement('div');
        item.className = 'option-item';
        item.dataset.letter = letter;
        item.onclick = function() {
            if (item.classList.contains('disabled')) return;
            list.querySelectorAll('.option-item').forEach(function(el) { el.classList.remove('selected'); });
            item.classList.add('selected');
            document.getElementById('btn-submit-answer').disabled = false;
        };
        var marker = document.createElement('div');
        marker.className = 'option-marker';
        marker.textContent = letter;
        var textEl = document.createElement('div');
        textEl.className = 'option-text';
        textEl.textContent = text;
        item.appendChild(marker);
        item.appendChild(textEl);
        list.appendChild(item);
    });
    container.appendChild(list);
}

function renderMultiChoice(container, options) {
    var hint = document.createElement('div');
    hint.className = 'select-hint';
    hint.textContent = 'Select all correct answers';
    container.appendChild(hint);
    var list = document.createElement('div');
    list.className = 'option-list';
    options.forEach(function(opt) {
        var letter = opt.charAt(0);
        var text = opt.substring(3).trim();
        var item = document.createElement('div');
        item.className = 'option-item';
        item.dataset.letter = letter;
        item.onclick = function() {
            if (item.classList.contains('disabled')) return;
            item.classList.toggle('selected');
            var selected = list.querySelectorAll('.option-item.selected');
            document.getElementById('btn-submit-answer').disabled = selected.length === 0;
        };
        var marker = document.createElement('div');
        marker.className = 'option-marker';
        marker.textContent = letter;
        var textEl = document.createElement('div');
        textEl.className = 'option-text';
        textEl.textContent = text;
        item.appendChild(marker);
        item.appendChild(textEl);
        list.appendChild(item);
    });
    container.appendChild(list);
}

function renderYesNoGrid(container, data) {
    if (!data || !data.statements || data.statements.length === 0) {
        container.textContent = 'No statements found.';
        return;
    }
    var grid = document.createElement('div');
    grid.className = 'yesno-grid';
    var header = document.createElement('div');
    header.className = 'yesno-header';
    ['Statement', 'Yes', 'No'].forEach(function(label) {
        var div = document.createElement('div');
        div.textContent = label;
        header.appendChild(div);
    });
    grid.appendChild(header);
    data.statements.forEach(function(stmt, idx) {
        var row = document.createElement('div');
        row.className = 'yesno-row';
        row.dataset.index = idx;
        var stmtCell = document.createElement('div');
        stmtCell.className = 'yesno-statement';
        stmtCell.textContent = stmt.replace(/\*\*/g, '');
        row.appendChild(stmtCell);
        ['Yes', 'No'].forEach(function(val) {
            var cell = document.createElement('div');
            cell.className = 'yesno-choice';
            var radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'yesno_' + idx;
            radio.value = val;
            radio.onchange = function() {
                var rows = grid.querySelectorAll('.yesno-row');
                var all = true;
                rows.forEach(function(r, i) {
                    if (!r.querySelector('input[name="yesno_' + i + '"]:checked')) all = false;
                });
                document.getElementById('btn-submit-answer').disabled = !all;
            };
            cell.appendChild(radio);
            row.appendChild(cell);
        });
        grid.appendChild(row);
    });
    container.appendChild(grid);
}

function buildDropdownSlotControl(slot, idx, inline) {
    var wrapper = document.createElement(inline ? 'span' : 'div');
    wrapper.className = inline ? 'dropdown-slot dropdown-slot-inline' : 'dropdown-slot';
    wrapper.dataset.index = idx;
    wrapper.dataset.label = slot.label || '';

    if (!inline) {
        var label = document.createElement('label');
        label.textContent = slot.label;
        label.htmlFor = 'dd_' + idx;
        wrapper.appendChild(label);
    }

    var select = document.createElement('select');
    if (!inline) {
        select.id = 'dd_' + idx;
    }
    select.onchange = checkDropdownComplete;
    select.setAttribute('aria-label', slot.label || ('Dropdown ' + (idx + 1)));

    var defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- Select --';
    select.appendChild(defaultOpt);

    (slot.options || []).forEach(function(optText) {
        var option = document.createElement('option');
        option.value = optText;
        option.textContent = optText;
        select.appendChild(option);
    });

    wrapper.appendChild(select);
    return wrapper;
}

function getDropdownSlotLabel(slotEl) {
    if (!slotEl) return '';
    return slotEl.dataset.label || (slotEl.querySelector('label') ? slotEl.querySelector('label').textContent : '');
}

function renderDropdown(container, data, inlineSlots) {
    if (!data || !data.slots || data.slots.length === 0) {
        container.textContent = 'No dropdown data.';
        return;
    }

    var hasRemainingSlots = false;
    data.slots.forEach(function(slot, idx) {
        if (!inlineSlots || !inlineSlots[idx]) {
            hasRemainingSlots = true;
        }
    });

    if (!hasRemainingSlots) {
        checkDropdownComplete();
        return;
    }

    var form = document.createElement('div');
    form.className = 'dropdown-form';
    data.slots.forEach(function(slot, idx) {
        if (!inlineSlots || !inlineSlots[idx]) {
            form.appendChild(buildDropdownSlotControl(slot, idx, false));
        }
    });
    container.appendChild(form);
    checkDropdownComplete();
}

function checkDropdownComplete() {
    var selects = document.querySelectorAll('.dropdown-slot select');
    var all = true;
    selects.forEach(function(sel) {
        if (!sel.value) all = false;
    });
    document.getElementById('btn-submit-answer').disabled = !all;
}

var draggedChip = null;

function renderDragDrop(container, data) {
    if (!data || !data.source_items || !data.target_slots) {
        container.textContent = 'No drag-drop data.';
        return;
    }
    var ddContainer = document.createElement('div');
    ddContainer.className = 'drag-drop-container';
    var sourceArea = document.createElement('div');
    sourceArea.className = 'drag-source-pool';
    var sourceTitle = document.createElement('div');
    sourceTitle.className = 'drag-section-title';
    sourceTitle.textContent = 'Available Items';
    sourceArea.appendChild(sourceTitle);
    var pool = document.createElement('div');
    pool.className = 'drag-pool-items';
    pool.ondragover = function(e) { e.preventDefault(); };
    pool.ondrop = function(e) {
        e.preventDefault();
        if (!draggedChip) return;
        pool.appendChild(draggedChip);
        checkDDComplete();
    };
    var shuffled = data.source_items.slice().sort(function() { return Math.random() - 0.5; });
    shuffled.forEach(function(item) {
        var chip = document.createElement('div');
        chip.className = 'drag-chip';
        chip.draggable = true;
        chip.textContent = item;
        chip.dataset.value = item;
        chip.ondragstart = function(e) {
            draggedChip = chip;
            chip.classList.add('dragging');
            e.dataTransfer.setData('text/plain', item);
        };
        chip.ondragend = function() { chip.classList.remove('dragging'); draggedChip = null; };
        pool.appendChild(chip);
    });
    sourceArea.appendChild(pool);
    var targetArea = document.createElement('div');
    targetArea.className = 'drag-target-area';
    var targetTitle = document.createElement('div');
    targetTitle.className = 'drag-section-title';
    targetTitle.textContent = 'Drop Here';
    targetArea.appendChild(targetTitle);
    data.target_slots.forEach(function(slotLabel) {
        var wrap = document.createElement('div');
        wrap.className = 'target-slot-wrap';
        var label = document.createElement('div');
        label.className = 'target-slot-label';
        label.textContent = slotLabel;
        var dropzone = document.createElement('div');
        dropzone.className = 'target-dropzone';
        dropzone.dataset.slot = slotLabel;
        dropzone.ondragover = function(e) { e.preventDefault(); dropzone.classList.add('drag-over'); };
        dropzone.ondragleave = function() { dropzone.classList.remove('drag-over'); };
        dropzone.ondrop = function(e) {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            if (!draggedChip) return;
            var existing = dropzone.querySelector('.drag-chip');
            if (existing) pool.appendChild(existing);
            dropzone.appendChild(draggedChip);
            checkDDComplete();
        };
        wrap.appendChild(label);
        wrap.appendChild(dropzone);
        targetArea.appendChild(wrap);
    });
    ddContainer.appendChild(sourceArea);
    ddContainer.appendChild(targetArea);
    container.appendChild(ddContainer);
}

function checkDDComplete() {
    var dropzones = document.querySelectorAll('.target-dropzone');
    var all = true;
    dropzones.forEach(function(dz) { if (!dz.querySelector('.drag-chip')) all = false; });
    document.getElementById('btn-submit-answer').disabled = !all;
}


// ── Restore Previous Answer ────────────────────────────
function restoreUserResponse(resp) {
    if (!resp) return;
    if (currentQuestionType === 'single_choice' && resp.answer) {
        var item = document.querySelector('.option-item[data-letter="' + resp.answer + '"]');
        if (item) item.classList.add('selected');
    }
    if (currentQuestionType === 'multi_choice' && resp.answers) {
        resp.answers.forEach(function(letter) {
            var item = document.querySelector('.option-item[data-letter="' + letter + '"]');
            if (item) item.classList.add('selected');
        });
    }
    if (currentQuestionType === 'yes_no_grid' && resp.answers) {
        resp.answers.forEach(function(val, idx) {
            if (!val) return;
            document.querySelectorAll('input[name="yesno_' + idx + '"]').forEach(function(r) {
                if (r.value === val) r.checked = true;
            });
        });
    }
    if (currentQuestionType === 'dropdown' && resp.slots) {
        document.querySelectorAll('.dropdown-slot').forEach(function(slot) {
            var label = getDropdownSlotLabel(slot);
            var select = slot.querySelector('select');
            if (resp.slots[label]) select.value = resp.slots[label];
        });
    }
}


// ── Save Answer (no feedback in exam mode) ─────────────
async function saveAnswer() {
    var btn = document.getElementById('btn-submit-answer');
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = 'Saving...';

    var timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    var userResponse = collectUserResponse();

    var result = await api('/exam/' + SESSION_ID + '/answer', {
        method: 'POST',
        body: {
            question_id: currentQuestionId,
            user_response: userResponse,
            time_spent_seconds: timeSpent,
        },
    });

    if (!result) {
        btn.disabled = false;
        btn.textContent = 'Save Answer';
        return;
    }

    answeredSet.add(currentIndex);
    btn.textContent = 'Saved';

    updateNavigator();
    updateProgressBar();

    // Auto-advance after brief delay
    setTimeout(function() {
        if (currentIndex < totalQuestions - 1) {
            navigateQuestion(1);
        }
    }, 300);
}

function collectUserResponse() {
    if (currentQuestionType === 'single_choice') {
        var sel = document.querySelector('.option-item.selected');
        return { answer: sel ? sel.dataset.letter : '' };
    }
    if (currentQuestionType === 'multi_choice') {
        var selected = document.querySelectorAll('.option-item.selected');
        return { answers: Array.from(selected).map(function(el) { return el.dataset.letter; }) };
    }
    if (currentQuestionType === 'yes_no_grid') {
        var answers = [];
        document.querySelectorAll('.yesno-row').forEach(function(row, idx) {
            var checked = row.querySelector('input[name="yesno_' + idx + '"]:checked');
            answers.push(checked ? checked.value : '');
        });
        return { answers: answers };
    }
    if (currentQuestionType === 'dropdown') {
        var slots = {};
        document.querySelectorAll('.dropdown-slot').forEach(function(slot) {
            var label = getDropdownSlotLabel(slot);
            slots[label] = slot.querySelector('select').value;
        });
        return { slots: slots };
    }
    if (currentQuestionType === 'drag_drop') {
        var mapping = {};
        document.querySelectorAll('.target-dropzone').forEach(function(dz) {
            var chip = dz.querySelector('.drag-chip');
            mapping[dz.dataset.slot] = chip ? chip.dataset.value : '';
        });
        return { mapping: mapping };
    }
    return {};
}


// ── Submit Exam ────────────────────────────────────────
async function submitExam() {
    var unanswered = totalQuestions - answeredSet.size;
    var flaggedCount = flaggedSet.size;
    var msg = 'Submit your exam?';
    if (unanswered > 0) msg += '\n' + unanswered + ' unanswered question(s).';
    if (flaggedCount > 0) msg += '\n' + flaggedCount + ' flagged question(s).';
    if (!confirm(msg)) return;

    var result = await api('/exam/' + SESSION_ID + '/complete', { method: 'POST' });
    if (result) {
        clearInterval(timerInterval);
        window.location.href = '/results/' + SESSION_ID;
    }
}


// ── Case Study ─────────────────────────────────────────
function handleCaseStudy(csData) {
    var banner = document.getElementById('case-study-banner');
    var showBtn = document.getElementById('cs-show-btn');
    if (!csData) {
        banner.style.display = 'none';
        showBtn.style.display = 'none';
        if (csOpen) toggleCaseStudy();
        return;
    }
    banner.style.display = '';
    showBtn.style.display = '';
    document.getElementById('case-study-company').textContent = 'Case Study: ' + csData.company_name;
    document.getElementById('cs-topic-badge').textContent = 'TOPIC ' + csData.topic_number;
    document.getElementById('cs-company-name').textContent = csData.company_name;
    var body = document.getElementById('cs-body');
    body.textContent = '';
    renderMarkdownSafe(csData.scenario_text, body);
}

function toggleCaseStudy() {
    var panel = document.getElementById('case-study-panel');
    csOpen = !csOpen;
    if (csOpen) panel.classList.add('open');
    else panel.classList.remove('open');
}


// ── Navigation ─────────────────────────────────────────
function navigateQuestion(delta) {
    var newIndex = currentIndex + delta;
    if (newIndex < 0 || newIndex >= totalQuestions) return;
    loadQuestion(newIndex);
}

function flagQuestion() {
    var btn = document.getElementById('btn-flag');
    if (flaggedSet.has(currentIndex)) {
        flaggedSet.delete(currentIndex);
        btn.style.borderColor = '';
        btn.style.color = '';
    } else {
        flaggedSet.add(currentIndex);
        btn.style.borderColor = 'var(--c-warning)';
        btn.style.color = 'var(--c-warning-text)';
    }
    updateNavigator();
}

function updateNavButtons() {
    document.getElementById('btn-prev').disabled = currentIndex === 0;
    var isLast = currentIndex >= totalQuestions - 1;
    document.getElementById('btn-next').style.display = isLast ? 'none' : '';
    document.getElementById('btn-submit-exam').style.display = isLast ? '' : 'none';
}

function updateProgressBar() {
    var pct = totalQuestions > 0 ? Math.round(answeredSet.size / totalQuestions * 100) : 0;
    document.getElementById('progress-fill').style.width = pct + '%';
}


// ── Navigator ──────────────────────────────────────────
function buildNavigator() {
    var nav = document.getElementById('question-nav');
    nav.textContent = '';
    var start = navPage * NAV_PAGE_SIZE;
    var end = Math.min(start + NAV_PAGE_SIZE, totalQuestions);
    for (var i = start; i < end; i++) {
        var btn = document.createElement('button');
        btn.className = 'q-nav-item';
        btn.textContent = i + 1;
        (function(idx) { btn.onclick = function() { loadQuestion(idx); }; })(i);
        if (i === currentIndex) btn.classList.add('current');
        if (answeredSet.has(i)) btn.classList.add('answered');
        if (flaggedSet.has(i)) btn.classList.add('flagged');
        nav.appendChild(btn);
    }
    document.getElementById('nav-page-label').textContent = (start + 1) + '\u2013' + end;
}

function updateNavigator() {
    var targetPage = Math.floor(currentIndex / NAV_PAGE_SIZE);
    if (targetPage !== navPage) navPage = targetPage;
    buildNavigator();
}

function navPrevPage() {
    if (navPage > 0) { navPage--; buildNavigator(); }
}

function navNextPage() {
    var maxPage = Math.floor((totalQuestions - 1) / NAV_PAGE_SIZE);
    if (navPage < maxPage) { navPage++; buildNavigator(); }
}

function jumpToQuestion(val) {
    var num = parseInt(val, 10);
    if (num >= 1 && num <= totalQuestions) loadQuestion(num - 1);
}
