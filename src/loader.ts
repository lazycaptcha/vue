/**
 * Idempotent script loader for the LazyCaptcha widget.
 * Multiple <LazyCaptcha> components share a single <script> tag.
 */

const DEFAULT_BASE = 'https://lazycaptcha.com';

let loadPromise: Promise<void> | null = null;

export function loadLazyCaptchaScript(baseUrl: string = DEFAULT_BASE): Promise<void> {
    if (typeof window === 'undefined') {
        return Promise.resolve(); // SSR no-op
    }
    if (window.LazyCaptcha) {
        return Promise.resolve();
    }
    if (loadPromise) {
        return loadPromise;
    }

    const src = `${baseUrl.replace(/\/$/, '')}/api/captcha/v1/lazycaptcha.js`;

    loadPromise = new Promise<void>((resolve, reject) => {
        // Reuse existing tag if present
        const existing = document.querySelector<HTMLScriptElement>(
            `script[src="${src}"]`
        );
        if (existing) {
            if (window.LazyCaptcha) return resolve();
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('Widget script failed to load')));
            return;
        }

        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.defer = true;
        s.addEventListener('load', () => resolve());
        s.addEventListener('error', () => reject(new Error('Widget script failed to load')));
        document.head.appendChild(s);
    });

    return loadPromise;
}
