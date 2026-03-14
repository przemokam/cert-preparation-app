/**
 * Flashcards — Interactive study cards with spaced repetition.
 */

let fcCards = [];
let fcIndex = 0;
let fcFlipped = false;
let fcSessionActive = false;
const fcCertCode = getActiveCertificationCode();

document.addEventListener('DOMContentLoaded', loadFlashcardStats);

async function loadFlashcardStats() {
    if (!fcCertCode) return;
    try {
        const stats = await api('/flashcards/stats?certification_code=' + encodeURIComponent(fcCertCode));

        document.getElementById('fc-due-count').textContent = stats.due || 0;
        document.getElementById('fc-mastered-count').textContent = stats.mastered || 0;
        document.getElementById('fc-total-count').textContent = stats.total || 0;

        const seenPct = stats.total > 0 ? Math.round(((stats.seen || 0) / stats.total) * 100) : 0;
        document.getElementById('fc-progress-fill').style.width = seenPct + '%';

        // Category pills
        const catContainer = document.getElementById('fc-categories');
        if (catContainer && stats.categories) {
            catContainer.textContent = '';
            const catLabels = { 'exam_trap': 'Exam Traps', 'key_fact': 'Key Facts', 'tool': 'Tools' };
            const catColors = { 'exam_trap': '#e74c3c', 'key_fact': '#3498db', 'tool': '#2ecc71' };
            Object.entries(stats.categories).forEach(([cat, count]) => {
                const pill = document.createElement('button');
                pill.className = 'badge';
                pill.style.cssText = 'cursor: pointer; padding: 6px 14px; font-size: 12px; border-radius: 20px; border: 1px solid ' + (catColors[cat] || '#888') + '60; background: ' + (catColors[cat] || '#888') + '15; color: ' + (catColors[cat] || '#888') + ';';
                pill.textContent = (catLabels[cat] || cat) + ' (' + count + ')';
                pill.onclick = () => startFlashcardSession('category', cat);
                catContainer.appendChild(pill);
            });
        }

        if ((stats.total || 0) === 0) {
            document.getElementById('fc-start-btn').disabled = true;
            document.getElementById('fc-start-btn').textContent = 'No flashcards available';
        }
    } catch (e) {
        console.error('Failed to load flashcard stats:', e);
    }
}

async function startFlashcardSession(mode, category) {
    let url = '/flashcards/cards?certification_code=' + encodeURIComponent(fcCertCode) + '&limit=50';
    if (mode === 'due') url += '&due_only=true';
    if (mode === 'category' && category) url += '&category=' + encodeURIComponent(category);

    try {
        const data = await api(url);
        fcCards = data.cards || [];
        if (fcCards.length === 0) {
            alert('No cards available for this selection.');
            return;
        }
        // Shuffle
        for (let i = fcCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [fcCards[i], fcCards[j]] = [fcCards[j], fcCards[i]];
        }
        fcIndex = 0;
        fcSessionActive = true;

        // Hide start buttons, show session
        document.getElementById('fc-session').style.display = 'block';
        document.getElementById('fc-card-meta').style.display = 'flex';

        // Hide start buttons and category pills during session
        document.getElementById('fc-start-area').style.display = 'none';
        document.getElementById('fc-categories').style.display = 'none';

        showCard();
    } catch (e) {
        console.error('Failed to start flashcard session:', e);
        alert('Failed to load flashcards: ' + e.message);
    }
}

function showCard() {
    if (fcIndex >= fcCards.length) {
        // Session complete
        document.getElementById('fc-card-text').textContent = 'Session complete! You reviewed ' + fcCards.length + ' cards.';
        document.getElementById('fc-card-label').textContent = 'DONE';
        document.getElementById('fc-flip-hint').textContent = 'Refresh the page to start a new session';
        document.getElementById('fc-rating').style.display = 'none';
        document.getElementById('fc-card-meta').style.display = 'none';
        fcSessionActive = false;

        // Refresh stats
        loadFlashcardStats();

        // Show start buttons and categories again
        document.getElementById('fc-start-area').style.display = '';
        document.getElementById('fc-categories').style.display = '';
        return;
    }

    const card = fcCards[fcIndex];
    fcFlipped = false;

    document.getElementById('fc-counter').textContent = 'Card ' + (fcIndex + 1) + ' of ' + fcCards.length;
    document.getElementById('fc-card-label').textContent = 'QUESTION';
    document.getElementById('fc-card-text').textContent = card.front;
    document.getElementById('fc-flip-hint').textContent = 'Click to reveal answer';
    document.getElementById('fc-flip-hint').style.display = '';
    document.getElementById('fc-rating').style.display = 'none';

    // Category badge — styled per category
    const catBadge = document.getElementById('fc-card-category');
    const catLabels = { 'exam_trap': 'Exam Trap', 'key_fact': 'Key Fact', 'tool': 'Tool' };
    const catColors = { 'exam_trap': '#e74c3c', 'key_fact': '#3498db', 'tool': '#2ecc71' };
    catBadge.textContent = catLabels[card.category] || card.category;
    catBadge.style.background = (catColors[card.category] || '#888') + '20';
    catBadge.style.color = catColors[card.category] || '#888';
    catBadge.style.border = '1px solid ' + (catColors[card.category] || '#888') + '40';

    // Box level — show as progress dots
    const boxEl = document.getElementById('fc-card-box');
    const boxLabels = ['New', 'Seen', 'Shaky', 'Learning', 'Known', 'Mastered'];
    const boxDots = Array.from({length: 5}, (_, i) => i < card.box ? '\u25cf' : '\u25cb').join('');
    boxEl.textContent = card.box === 0 ? 'New card' : boxLabels[card.box] + ' ' + boxDots;

    // Reset card style
    const cardEl = document.getElementById('fc-card');
    cardEl.style.borderColor = 'var(--c-border)';
    cardEl.style.background = 'var(--c-surface)';
}

function flipCard() {
    if (fcFlipped || fcIndex >= fcCards.length) return;
    fcFlipped = true;

    const card = fcCards[fcIndex];
    document.getElementById('fc-card-label').textContent = 'ANSWER';
    document.getElementById('fc-card-text').textContent = card.back;
    document.getElementById('fc-flip-hint').style.display = 'none';
    document.getElementById('fc-rating').style.display = 'block';

    // Visual flip effect
    const cardEl = document.getElementById('fc-card');
    cardEl.style.borderColor = 'var(--c-primary)';
}

async function rateCard(confidence) {
    const card = fcCards[fcIndex];

    // Disable buttons during request
    const buttons = document.querySelectorAll('#fc-rating button');
    buttons.forEach(b => b.disabled = true);

    try {
        const result = await api('/flashcards/rate', {
            method: 'POST',
            body: { flashcard_id: card.id, confidence: confidence },
        });
        // Update card's box locally for display
        if (result && result.box !== undefined) {
            card.box = result.box;
        }
    } catch (e) {
        console.error('Failed to rate card:', e);
    }

    // Flash feedback color
    const cardEl = document.getElementById('fc-card');
    if (confidence === 1) cardEl.style.borderColor = 'var(--c-danger)';
    else if (confidence === 2) cardEl.style.borderColor = 'var(--c-primary)';
    else if (confidence === 3) cardEl.style.borderColor = 'var(--c-success)';

    // Re-enable buttons
    buttons.forEach(b => b.disabled = false);

    setTimeout(() => {
        fcIndex++;
        showCard();
    }, 250);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!fcSessionActive) return;
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!fcFlipped) flipCard();
    } else if (fcFlipped) {
        if (e.key === '1') rateCard(1);
        else if (e.key === '2') rateCard(2);
        else if (e.key === '3') rateCard(3);
    }
});
