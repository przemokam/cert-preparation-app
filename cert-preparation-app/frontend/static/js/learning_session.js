/**
 * Learning Session Controller — all 5 question types + feedback + explanation + confidence.
 * Uses safe DOM construction throughout (no innerHTML).
 */

// ── State ──────────────────────────────────────────────
let currentIndex = 0;
let totalQuestions = 0;
let currentQuestionId = null;
let currentQuestionType = null;
let currentSessionMode = 'learning';
let answeredSet = new Set();
let correctSet = new Set();
let incorrectSet = new Set();
let flaggedSet = new Set();
let navPage = 0;
let questionStartTime = 0;
let csOpen = false;
let currentQuestionIsPlaceholder = false;
const NAV_PAGE_SIZE = 50;


function isPlaceholderQuestion(data) {
    return !!(
        data && (
            data.is_placeholder ||
            (data.interactive_data && data.interactive_data.placeholder)
        )
    );
}


function renderPlaceholderState(container) {
    var panel = document.createElement('div');
    panel.className = 'explanation-panel';

    var section = document.createElement('div');
    section.className = 'explanation-section';

    var title = document.createElement('h4');
    title.className = 'expl-title';
    title.textContent = t('exam.placeholder_title') || 'Question intentionally omitted';
    section.appendChild(title);

    var message = document.createElement('div');
    message.className = 'explanation-text';
    message.textContent = t('exam.placeholder_message') ||
        'This source question is intentionally unavailable in the quiz app. Continue to the next question to preserve the original numbering.';
    section.appendChild(message);

    var continueHint = document.createElement('div');
    continueHint.className = 'key-concept-card';
    continueHint.textContent = t('exam.placeholder_continue') ||
        'No answer is required here — use Next to continue.';
    section.appendChild(continueHint);

    panel.appendChild(section);
    container.appendChild(panel);
}

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadQuestion(0);
});

// ── Load Question ──────────────────────────────────────
async function loadQuestion(index) {
    questionStartTime = Date.now();
    const data = await api('/exam/' + SESSION_ID + '/question/' + index);
    if (!data) return;
    if (data._expired) {
        alert('Session expired.');
        window.location.href = '/';
        return;
    }

    currentIndex = data.index;
    totalQuestions = data.total;
    currentQuestionId = data.question_id;
    currentQuestionType = data.question_type;
    currentSessionMode = data.session_mode;
    currentQuestionIsPlaceholder = isPlaceholderQuestion(data);

    // Update header
    const srcNum = data.source_question_number || (index + 1);
    document.getElementById('question-counter').textContent =
        t('exam.question_of', { current: srcNum, total: totalQuestions }) || ('Question ' + srcNum + ' of ' + totalQuestions);

    // Domain badge
    const domainBadge = document.getElementById('question-domain');
    if (data.domains && data.domains.length > 0) {
        domainBadge.textContent = data.domains[0];
        domainBadge.style.display = '';
    } else {
        domainBadge.style.display = 'none';
    }

    // Case study
    handleCaseStudy(data.case_study);

    // Question text
    const textEl = document.getElementById('question-text');
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
    const interactive = document.getElementById('question-interactive');
    interactive.textContent = '';

    // Feedback / explanation / confidence areas
    document.getElementById('feedback-area').textContent = '';
    document.getElementById('explanation-area').textContent = '';
    document.getElementById('confidence-area').textContent = '';

    // Submit button
    const submitArea = document.getElementById('submit-area');
    submitArea.style.display = '';
    const submitBtn = document.getElementById('btn-submit-answer');
    submitBtn.disabled = true;
    submitBtn.textContent = t('exam.submit_answer') || 'Submit Answer';

    // Render by type
    if (currentQuestionIsPlaceholder) {
        renderPlaceholderState(interactive);
        submitArea.style.display = 'none';
    } else if (data.question_type === 'single_choice') {
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

    // If already answered, show feedback
    if (!currentQuestionIsPlaceholder && data.answered && data.correct_answer) {
        showFeedbackFromData(data);
    }

    // Update navigator + progress
    updateNavigator();
    updateProgressBar();
    updateNavButtons();

    // Flag button state
    const flagBtn = document.getElementById('btn-flag');
    if (flaggedSet.has(currentIndex)) {
        flagBtn.style.borderColor = 'var(--c-warning)';
        flagBtn.style.color = 'var(--c-warning-text)';
    } else {
        flagBtn.style.borderColor = '';
        flagBtn.style.color = '';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ── Single Choice ──────────────────────────────────────
function renderSingleChoice(container, options) {
    const list = document.createElement('div');
    list.className = 'option-list';

    options.forEach(function(opt) {
        var letter = opt.charAt(0);
        var text = opt.substring(3).trim();

        var item = document.createElement('div');
        item.className = 'option-item';
        item.dataset.letter = letter;
        item.onclick = function() { selectSingleChoice(item, letter); };

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

function selectSingleChoice(item, letter) {
    if (item.classList.contains('disabled')) return;
    var list = item.parentElement;
    list.querySelectorAll('.option-item').forEach(function(el) {
        el.classList.remove('selected');
    });
    item.classList.add('selected');
    document.getElementById('btn-submit-answer').disabled = false;
}


// ── Multi Choice ───────────────────────────────────────
function renderMultiChoice(container, options) {
    var hint = document.createElement('div');
    hint.className = 'select-hint';
    hint.textContent = t('exam.select_all_correct') || 'Select all correct answers';
    container.appendChild(hint);

    var list = document.createElement('div');
    list.className = 'option-list';

    options.forEach(function(opt) {
        var letter = opt.charAt(0);
        var text = opt.substring(3).trim();

        var item = document.createElement('div');
        item.className = 'option-item';
        item.dataset.letter = letter;
        item.onclick = function() { toggleMultiChoice(item); };

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

function toggleMultiChoice(item) {
    if (item.classList.contains('disabled')) return;
    item.classList.toggle('selected');
    var selected = item.parentElement.querySelectorAll('.option-item.selected');
    document.getElementById('btn-submit-answer').disabled = selected.length === 0;
}


// ── Yes/No Grid ────────────────────────────────────────
function renderYesNoGrid(container, data) {
    if (!data || !data.statements || data.statements.length === 0) {
        container.textContent = 'No statements found for this question.';
        return;
    }

    var grid = document.createElement('div');
    grid.className = 'yesno-grid';

    // Header
    var header = document.createElement('div');
    header.className = 'yesno-header';
    [t('exam.statement') || 'Statement', t('exam.yes') || 'Yes', t('exam.no') || 'No'].forEach(function(label) {
        var div = document.createElement('div');
        div.textContent = label;
        header.appendChild(div);
    });
    grid.appendChild(header);

    // Rows
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
            radio.onchange = checkYesNoComplete;
            cell.appendChild(radio);
            row.appendChild(cell);
        });

        grid.appendChild(row);
    });

    container.appendChild(grid);
}

function checkYesNoComplete() {
    var grid = document.querySelector('.yesno-grid');
    if (!grid) return;
    var rows = grid.querySelectorAll('.yesno-row');
    var allAnswered = true;
    rows.forEach(function(row, idx) {
        var checked = row.querySelector('input[name="yesno_' + idx + '"]:checked');
        if (!checked) allAnswered = false;
    });
    document.getElementById('btn-submit-answer').disabled = !allAnswered;
}


// ── Dropdown ───────────────────────────────────────────
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
    defaultOpt.textContent = t('exam.select_option') || '-- Select --';
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
        container.textContent = 'No dropdown data for this question.';
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
    var allSelected = true;
    selects.forEach(function(sel) {
        if (!sel.value) allSelected = false;
    });
    document.getElementById('btn-submit-answer').disabled = !allSelected;
}


// ── Drag & Drop ────────────────────────────────────────
var draggedChip = null;

function renderDragDrop(container, data) {
    if (!data || !data.source_items || !data.target_slots) {
        container.textContent = 'No drag-drop data for this question.';
        return;
    }

    var ddContainer = document.createElement('div');
    ddContainer.className = 'drag-drop-container';

    // Source pool
    var sourceArea = document.createElement('div');
    sourceArea.className = 'drag-source-pool';
    var sourceTitle = document.createElement('div');
    sourceTitle.className = 'drag-section-title';
    sourceTitle.textContent = t('exam.source_pool') || 'Available Items';
    sourceArea.appendChild(sourceTitle);

    var pool = document.createElement('div');
    pool.className = 'drag-pool-items';
    pool.ondragover = function(e) { e.preventDefault(); };
    pool.ondrop = function(e) { ddDropToPool(e, pool); };

    // Shuffle source items for display
    var shuffled = data.source_items.slice().sort(function() { return Math.random() - 0.5; });
    shuffled.forEach(function(item) {
        var chip = createDragChip(item);
        pool.appendChild(chip);
    });
    sourceArea.appendChild(pool);

    // Target area
    var targetArea = document.createElement('div');
    targetArea.className = 'drag-target-area';
    var targetTitle = document.createElement('div');
    targetTitle.className = 'drag-section-title';
    targetTitle.textContent = t('exam.target_slots') || 'Drop Here';
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
        dropzone.ondragover = function(e) {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        };
        dropzone.ondragleave = function() {
            dropzone.classList.remove('drag-over');
        };
        dropzone.ondrop = function(e) { ddDropToSlot(e, dropzone, pool); };

        wrap.appendChild(label);
        wrap.appendChild(dropzone);
        targetArea.appendChild(wrap);
    });

    ddContainer.appendChild(sourceArea);
    ddContainer.appendChild(targetArea);
    container.appendChild(ddContainer);
}

function createDragChip(text) {
    var chip = document.createElement('div');
    chip.className = 'drag-chip';
    chip.draggable = true;
    chip.textContent = text;
    chip.dataset.value = text;
    chip.ondragstart = function(e) {
        draggedChip = chip;
        chip.classList.add('dragging');
        e.dataTransfer.setData('text/plain', text);
    };
    chip.ondragend = function() {
        chip.classList.remove('dragging');
        draggedChip = null;
    };
    return chip;
}

function ddDropToSlot(e, dropzone, pool) {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (!draggedChip) return;

    // If slot already has a chip, move it back to pool
    var existing = dropzone.querySelector('.drag-chip');
    if (existing) {
        pool.appendChild(existing);
    }

    dropzone.appendChild(draggedChip);
    checkDragDropComplete();
}

function ddDropToPool(e, pool) {
    e.preventDefault();
    if (!draggedChip) return;
    pool.appendChild(draggedChip);
    checkDragDropComplete();
}

function checkDragDropComplete() {
    var dropzones = document.querySelectorAll('.target-dropzone');
    var allFilled = true;
    dropzones.forEach(function(dz) {
        if (!dz.querySelector('.drag-chip')) allFilled = false;
    });
    document.getElementById('btn-submit-answer').disabled = !allFilled;
}


// ── Submit Answer ──────────────────────────────────────
async function submitAnswer() {
    var btn = document.getElementById('btn-submit-answer');
    if (btn.disabled || currentQuestionIsPlaceholder) return;
    btn.disabled = true;
    btn.textContent = t('exam.submitting') || 'Submitting...';

    try {
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
            btn.textContent = 'Submit Answer';
            return;
        }

        answeredSet.add(currentIndex);
        if (result.is_correct) {
            correctSet.add(currentIndex);
        } else {
            incorrectSet.add(currentIndex);
        }

        // Show feedback
        showFeedback(result.is_correct, result.correct_answer, result.explanation);

        // Hide submit button
        document.getElementById('submit-area').style.display = 'none';

        // Disable interactive elements
        disableInteractive();

        updateNavigator();
        updateProgressBar();
    } catch (e) {
        console.error('Submit failed:', e);
        btn.disabled = false;
        btn.textContent = t('exam.submit_answer') || 'Submit Answer';
        alert((t('exam.submit_failed') || 'Failed to submit answer: ') + e.message);
    }
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
        var rows = document.querySelectorAll('.yesno-row');
        var answers = [];
        rows.forEach(function(row, idx) {
            var checked = row.querySelector('input[name="yesno_' + idx + '"]:checked');
            answers.push(checked ? checked.value : '');
        });
        return { answers: answers };
    }
    if (currentQuestionType === 'dropdown') {
        var slots = {};
        document.querySelectorAll('.dropdown-slot').forEach(function(slot) {
            var label = getDropdownSlotLabel(slot);
            var sel2 = slot.querySelector('select');
            slots[label] = sel2.value;
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


// ── Feedback Display ───────────────────────────────────
function showFeedback(isCorrect, correctAnswer, explanationJson) {
    // Toast
    var feedbackArea = document.getElementById('feedback-area');
    feedbackArea.textContent = '';

    var toast = document.createElement('div');
    toast.className = 'feedback-toast ' + (isCorrect ? 'correct' : 'incorrect');

    var icon = document.createElement('div');
    icon.className = 'feedback-icon';
    icon.textContent = isCorrect ? '\u2713' : '\u2717';

    var msg = document.createElement('span');
    msg.textContent = isCorrect ? (t('exam.correct_label') || 'Correct!') : (t('exam.incorrect_label') || 'Incorrect');

    toast.appendChild(icon);
    toast.appendChild(msg);
    feedbackArea.appendChild(toast);

    // Highlight correct/incorrect options
    highlightAnswers(correctAnswer);

    // Explanation
    if (explanationJson) {
        renderExplanation(explanationJson, correctAnswer);
    }

    // Confidence buttons
    renderConfidenceBar();
}

function showFeedbackFromData(data) {
    answeredSet.add(data.index);
    if (data.is_correct) correctSet.add(data.index);
    else incorrectSet.add(data.index);

    showFeedback(data.is_correct, data.correct_answer, data.explanation);
    document.getElementById('submit-area').style.display = 'none';
    disableInteractive();

    // Restore user's previous selection
    restoreUserResponse(data.user_response);
}

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
            var radios = document.querySelectorAll('input[name="yesno_' + idx + '"]');
            radios.forEach(function(r) {
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

function highlightAnswers(correctAnswer) {
    if (!correctAnswer) return;

    // Single choice
    if (correctAnswer.answer && typeof correctAnswer.answer === 'string' && document.querySelector('.option-item')) {
        var correctLetter = correctAnswer.answer;
        document.querySelectorAll('.option-item').forEach(function(item) {
            if (item.dataset.letter === correctLetter) {
                item.classList.add('correct');
            } else if (item.classList.contains('selected')) {
                item.classList.add('incorrect');
            }
        });
    }

    // Multi choice
    if (correctAnswer.answers && document.querySelector('.option-item') && currentQuestionType === 'multi_choice') {
        var correctLetters = {};
        correctAnswer.answers.forEach(function(a) { correctLetters[a.toUpperCase()] = true; });
        document.querySelectorAll('.option-item').forEach(function(item) {
            var letter = item.dataset.letter;
            if (correctLetters[letter]) {
                item.classList.add('correct');
            } else if (item.classList.contains('selected')) {
                item.classList.add('incorrect');
            }
        });
    }

    // Yes/No grid
    if (correctAnswer.answers && document.querySelector('.yesno-grid')) {
        var yesnoRows = document.querySelectorAll('.yesno-row');
        correctAnswer.answers.forEach(function(ans, idx) {
            if (idx >= yesnoRows.length) return;
            var row = yesnoRows[idx];
            var checked = row.querySelector('input[name="yesno_' + idx + '"]:checked');
            var userVal = checked ? checked.value : '';
            if (userVal.toLowerCase() === ans.toLowerCase()) {
                row.classList.add('correct-row');
            } else {
                row.classList.add('incorrect-row');
            }
        });
    }

    // Dropdown slots
    if (correctAnswer.slots) {
        correctAnswer.slots.forEach(function(slot) {
            document.querySelectorAll('.dropdown-slot').forEach(function(el) {
                var label = getDropdownSlotLabel(el);
                if (label === slot.label) {
                    var sel = el.querySelector('select');
                    if (sel.value === slot.correct) {
                        el.classList.add('correct');
                    } else {
                        el.classList.add('incorrect');
                    }
                }
            });
        });
    }

    // Drag drop
    if (correctAnswer.correct_order) {
        var dropzones = document.querySelectorAll('.target-dropzone');
        correctAnswer.correct_order.forEach(function(correctVal, idx) {
            if (idx >= dropzones.length) return;
            var dz = dropzones[idx];
            var chip = dz.querySelector('.drag-chip');
            if (chip && chip.dataset.value === correctVal) {
                dz.classList.add('correct');
            } else {
                dz.classList.add('incorrect');
            }
        });
    }
}

function disableInteractive() {
    document.querySelectorAll('.option-item').forEach(function(el) { el.classList.add('disabled'); });
    document.querySelectorAll('.yesno-choice input').forEach(function(el) { el.disabled = true; });
    document.querySelectorAll('.dropdown-slot select').forEach(function(el) { el.disabled = true; });
    document.querySelectorAll('.drag-chip').forEach(function(el) { el.draggable = false; });
}


// ── Explanation Renderer ───────────────────────────────
function renderExplanation(explanationJson, correctAnswer) {
    var expl;
    try {
        expl = typeof explanationJson === 'string' ? JSON.parse(explanationJson) : explanationJson;
    } catch (e) {
        expl = { text: String(explanationJson || '') };
    }

    var area = document.getElementById('explanation-area');
    area.textContent = '';

    var panel = document.createElement('div');
    panel.className = 'explanation-panel';

    // Correct answer summary
    if (correctAnswer) {
        var ansSection = document.createElement('div');
        ansSection.className = 'explanation-section';
        var ansTitle = document.createElement('h4');
        ansTitle.className = 'expl-title';
        ansTitle.textContent = t('exam.correct_answer') || 'Correct Answer';
        ansSection.appendChild(ansTitle);
        var ansText = document.createElement('div');
        ansText.className = 'explanation-text';
        ansText.textContent = formatCorrectAnswer(correctAnswer);
        ansSection.appendChild(ansText);
        panel.appendChild(ansSection);
    }

    // Main explanation
    if (expl.text) {
        var explSection = document.createElement('div');
        explSection.className = 'explanation-section';
        var explTitle = document.createElement('h4');
        explTitle.className = 'expl-title';
        explTitle.textContent = t('exam.explanation') || 'Explanation';
        explSection.appendChild(explTitle);
        var explText = document.createElement('div');
        explText.className = 'explanation-text';
        renderMarkdownSafe(expl.text, explText);
        explSection.appendChild(explText);
        panel.appendChild(explSection);
    }

    // Exam traps
    if (expl.exam_traps && expl.exam_traps.length > 0) {
        var trapSection = document.createElement('div');
        trapSection.className = 'explanation-section';
        var trapTitle = document.createElement('h4');
        trapTitle.className = 'trap-title';
        trapTitle.textContent = t('exam.exam_trap') || 'Exam Trap';
        trapSection.appendChild(trapTitle);
        expl.exam_traps.forEach(function(trap) {
            var card = document.createElement('div');
            card.className = 'exam-trap-card';
            card.textContent = trap;
            trapSection.appendChild(card);
        });
        panel.appendChild(trapSection);
    }

    // Why incorrect
    if (expl.why_incorrect && Object.keys(expl.why_incorrect).length > 0) {
        var wiSection = document.createElement('div');
        wiSection.className = 'explanation-section';
        var wiTitle = document.createElement('h4');
        wiTitle.className = 'incorrect-title';
        wiTitle.textContent = t('exam.why_incorrect') || 'Why Other Options Are Wrong';
        wiSection.appendChild(wiTitle);
        var wiList = document.createElement('div');
        wiList.className = 'why-incorrect-list';
        Object.keys(expl.why_incorrect).forEach(function(letter) {
            var reason = expl.why_incorrect[letter];
            var item = document.createElement('div');
            item.className = 'why-incorrect-item';
            var letterEl = document.createElement('span');
            letterEl.className = 'wi-letter';
            letterEl.textContent = letter + ':';
            var reasonEl = document.createElement('span');
            reasonEl.textContent = reason;
            item.appendChild(letterEl);
            item.appendChild(reasonEl);
            wiList.appendChild(item);
        });
        wiSection.appendChild(wiList);
        panel.appendChild(wiSection);
    }

    // Key concept
    if (expl.key_concept) {
        var kcSection = document.createElement('div');
        kcSection.className = 'explanation-section';
        var kcTitle = document.createElement('h4');
        kcTitle.className = 'concept-title';
        kcTitle.textContent = t('exam.key_concept') || 'Key Concept';
        kcSection.appendChild(kcTitle);
        var kcCard = document.createElement('div');
        kcCard.className = 'key-concept-card';
        kcCard.textContent = expl.key_concept;
        kcSection.appendChild(kcCard);
        panel.appendChild(kcSection);
    }

    area.appendChild(panel);
}

function formatCorrectAnswer(ca) {
    if (ca.answer && typeof ca.answer === 'string') return ca.answer;
    if (ca.answers) return ca.answers.join(', ');
    if (ca.slots) return ca.slots.map(function(s) { return s.label + ': ' + s.correct; }).join(' | ');
    if (ca.correct_order) return ca.correct_order.join(' \u2192 ');
    return '';
}


// ── Confidence Bar ─────────────────────────────────────
function renderConfidenceBar() {
    var area = document.getElementById('confidence-area');
    area.textContent = '';

    var wrapper = document.createElement('div');
    wrapper.className = 'confidence-wrapper';

    var hint = document.createElement('div');
    hint.className = 'confidence-hint';
    hint.textContent = t('confidence.hint') || 'Rate your confidence — this controls spaced repetition scheduling:';
    wrapper.appendChild(hint);

    var bar = document.createElement('div');
    bar.className = 'confidence-bar';

    var levels = [
        { value: 1, text: t('confidence.guessed') || 'Guessed', desc: t('confidence.guessed_desc') || 'Review sooner' },
        { value: 2, text: t('confidence.knew_it') || 'Knew it', desc: t('confidence.knew_it_desc') || 'Normal schedule' },
        { value: 3, text: t('confidence.too_easy') || 'Too easy', desc: t('confidence.too_easy_desc') || 'Review later' },
    ];
    levels.forEach(function(opt) {
        var btn = document.createElement('button');
        btn.className = 'confidence-btn';
        btn.dataset.level = opt.value;

        var label = document.createElement('span');
        label.textContent = opt.text;
        btn.appendChild(label);

        var desc = document.createElement('small');
        desc.style.cssText = 'display: block; font-size: 10px; opacity: 0.7; margin-top: 2px;';
        desc.textContent = opt.desc;
        btn.appendChild(desc);

        btn.onclick = function() { setConfidence(opt.value, btn); };
        bar.appendChild(btn);
    });

    wrapper.appendChild(bar);

    var feedback = document.createElement('div');
    feedback.id = 'confidence-feedback';
    feedback.style.cssText = 'font-size: 12px; color: var(--c-text-muted); text-align: center; min-height: 18px;';
    wrapper.appendChild(feedback);

    area.appendChild(wrapper);
}

async function setConfidence(level, btn) {
    btn.parentElement.querySelectorAll('.confidence-btn').forEach(function(b) {
        b.classList.remove('selected');
    });
    btn.classList.add('selected');

    try {
        var result = await api('/exam/' + SESSION_ID + '/confidence', {
            method: 'POST',
            body: { question_id: currentQuestionId, confidence: level },
        });

        var fb = document.getElementById('confidence-feedback');
        if (fb && result && result.box !== undefined) {
            var boxKeys = ['box_unseen', 'box_new', 'box_shaky', 'box_learning', 'box_known', 'box_mastered'];
            var boxName = t('confidence.' + (boxKeys[result.box] || '')) || ['Unseen', 'New', 'Shaky', 'Learning', 'Known', 'Mastered'][result.box] || result.box;
            fb.textContent = (t('confidence.saved_prefix') || 'Saved — this question is now in box "') + boxName + (t('confidence.saved_suffix') || '"');
            fb.style.color = 'var(--c-success)';
        }
    } catch (e) {
        console.error('Confidence update failed:', e);
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
    document.getElementById('case-study-company').textContent =
        (t('exam.case_study_prefix') || 'Case Study: ') + csData.company_name;
    document.getElementById('cs-topic-badge').textContent =
        (t('exam.topic_prefix') || 'TOPIC ') + csData.topic_number;
    document.getElementById('cs-company-name').textContent = csData.company_name;

    var body = document.getElementById('cs-body');
    body.textContent = '';
    renderMarkdownSafe(csData.scenario_text, body);
}

function toggleCaseStudy() {
    var panel = document.getElementById('case-study-panel');
    csOpen = !csOpen;
    if (csOpen) {
        panel.classList.add('open');
    } else {
        panel.classList.remove('open');
    }
}


// ── Navigation ─────────────────────────────────────────
function navigateQuestion(delta) {
    var newIndex = currentIndex + delta;
    if (newIndex < 0 || newIndex >= totalQuestions) return;
    loadQuestion(newIndex);
}

async function flagQuestion() {
    var btn = document.getElementById('btn-flag');
    if (flaggedSet.has(currentIndex)) {
        flaggedSet.delete(currentIndex);
        btn.style.borderColor = '';
        btn.style.color = '';
        // Remove from review pool
        try {
            await api('/analytics/review-pool/unbookmark/' + currentQuestionId, { method: 'POST' });
        } catch (e) { /* ignore */ }
    } else {
        flaggedSet.add(currentIndex);
        btn.style.borderColor = 'var(--c-warning)';
        btn.style.color = 'var(--c-warning-text)';
        // Add to review pool
        try {
            await api('/analytics/review-pool/bookmark/' + currentQuestionId, { method: 'POST' });
        } catch (e) { /* ignore */ }
    }
    updateNavigator();
}

async function finishSession() {
    if (!confirm(t('exam.finish_confirm') || 'Finish this learning session?')) return;
    var result = await api('/exam/' + SESSION_ID + '/complete', { method: 'POST' });
    if (result) {
        window.location.href = '/results/' + SESSION_ID;
    }
}

function updateNavButtons() {
    document.getElementById('btn-prev').disabled = currentIndex === 0;
    var isLast = currentIndex >= totalQuestions - 1;
    document.getElementById('btn-next').style.display = isLast ? 'none' : '';
    document.getElementById('btn-finish').style.display = isLast ? '' : 'none';
}

function updateProgressBar() {
    var pct = totalQuestions > 0 ? Math.round(answeredSet.size / totalQuestions * 100) : 0;
    document.getElementById('progress-fill').style.width = pct + '%';
}


// ── Navigator Grid ─────────────────────────────────────
function buildNavigator() {
    var nav = document.getElementById('question-nav');
    nav.textContent = '';

    var start = navPage * NAV_PAGE_SIZE;
    var end = Math.min(start + NAV_PAGE_SIZE, totalQuestions);

    for (var i = start; i < end; i++) {
        var btn = document.createElement('button');
        btn.className = 'q-nav-item';
        btn.textContent = i + 1;
        (function(idx) {
            btn.onclick = function() { loadQuestion(idx); };
        })(i);

        if (i === currentIndex) btn.classList.add('current');
        if (correctSet.has(i)) btn.classList.add('correct');
        else if (incorrectSet.has(i)) btn.classList.add('incorrect');
        else if (answeredSet.has(i)) btn.classList.add('answered');
        if (flaggedSet.has(i)) btn.classList.add('flagged');

        nav.appendChild(btn);
    }

    document.getElementById('nav-page-label').textContent =
        (start + 1) + '\u2013' + end;
}

function updateNavigator() {
    var targetPage = Math.floor(currentIndex / NAV_PAGE_SIZE);
    if (targetPage !== navPage) {
        navPage = targetPage;
    }
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
    if (num >= 1 && num <= totalQuestions) {
        loadQuestion(num - 1);
    }
}
