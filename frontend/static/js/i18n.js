/**
 * i18n — Lightweight internationalization for AZ-500 Exam Simulator.
 * Reads data-i18n attributes and replaces text content.
 * Dispatches 'i18n:ready' custom event after initial load completes.
 */

const I18N = {
    currentLang: localStorage.getItem('lang') || 'en',
    translations: {},

    async init() {
        await this.loadLanguage(this.currentLang);
        this.apply();
        this.updateToggle();
        document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang: this.currentLang } }));
    },

    async loadLanguage(lang) {
        try {
            const resp = await fetch(`/static/i18n/${lang}.json`);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            this.translations = await resp.json();
            this.currentLang = lang;
            localStorage.setItem('lang', lang);
        } catch (e) {
            console.warn(`Failed to load language ${lang}, falling back to en`);
            if (lang !== 'en') {
                await this.loadLanguage('en');
            }
        }
    },

    apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = this.get(key);
            if (text) el.textContent = text;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const text = this.get(key);
            if (text) el.placeholder = text;
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const text = this.get(key);
            if (text) el.title = text;
        });
    },

    get(key, params) {
        let text = key.split('.').reduce((obj, k) => obj?.[k], this.translations) || '';
        if (params && text) {
            Object.keys(params).forEach(p => {
                text = text.replace('{' + p + '}', params[p]);
            });
        }
        return text;
    },

    updateToggle() {
        document.querySelectorAll('.lang-toggle button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
        });
    },

    async switchTo(lang) {
        await this.loadLanguage(lang);
        this.apply();
        this.updateToggle();
        document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang } }));
    }
};

/** Shorthand: t('exam.correct_label') or t('dashboard.spaced_review_desc', {count: 5}) */
function t(key, params) {
    return I18N.get(key, params);
}

document.addEventListener('DOMContentLoaded', () => I18N.init());
