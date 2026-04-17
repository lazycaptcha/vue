/**
 * Composable for programmatic control over a LazyCaptcha widget.
 *
 * Use when you need to render the widget imperatively (outside a template)
 * or manage multiple captcha instances.
 */

import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import { loadLazyCaptchaScript } from './loader';
import type { LazyCaptchaRenderOptions } from './types';

export interface UseLazyCaptchaReturn {
    containerRef: Ref<HTMLElement | null>;
    token: Ref<string | null>;
    isReady: Ref<boolean>;
    reset: () => void;
    getToken: () => string | null;
}

export function useLazyCaptcha(
    options: Omit<LazyCaptchaRenderOptions, 'callback'> & {
        baseUrl?: string;
        onVerify?: (token: string) => void;
        onExpired?: () => void;
        onError?: (err: unknown) => void;
    }
): UseLazyCaptchaReturn {
    const containerRef = ref<HTMLElement | null>(null);
    const token = ref<string | null>(null);
    const isReady = ref(false);

    async function mount() {
        if (!containerRef.value) return;

        try {
            await loadLazyCaptchaScript(options.baseUrl);
        } catch (err) {
            options.onError?.(err);
            return;
        }

        if (!window.LazyCaptcha) {
            options.onError?.(new Error('LazyCaptcha global unavailable'));
            return;
        }

        window.LazyCaptcha.render(containerRef.value, {
            sitekey: options.sitekey,
            type: options.type,
            theme: options.theme,
            callback: (t: string) => {
                token.value = t;
                options.onVerify?.(t);
            },
            'expired-callback': () => {
                token.value = null;
                options.onExpired?.();
            },
            'error-callback': (err: unknown) => {
                options.onError?.(err);
            },
        });

        isReady.value = true;
    }

    function reset() {
        if (containerRef.value && window.LazyCaptcha) {
            window.LazyCaptcha.reset(containerRef.value);
            token.value = null;
        }
    }

    function getToken(): string | null {
        if (containerRef.value && window.LazyCaptcha) {
            return window.LazyCaptcha.getToken(containerRef.value);
        }
        return null;
    }

    onMounted(mount);
    onBeforeUnmount(() => { isReady.value = false; });

    return { containerRef, token, isReady, reset, getToken };
}
