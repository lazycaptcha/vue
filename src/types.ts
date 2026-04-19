export type LazyCaptchaType = 'auto' | 'image_puzzle' | 'pow' | 'behavioral' | 'text_math' | 'press_hold' | 'rotate_align';
export type LazyCaptchaTheme = 'light' | 'dark' | 'auto';

export interface LazyCaptchaProps {
    /** Public site key from your LazyCaptcha dashboard (UUID). */
    sitekey: string;
    /** Challenge type. Defaults to 'auto'. */
    type?: LazyCaptchaType;
    /** Light or dark widget theme. */
    theme?: LazyCaptchaTheme;
    /** Base URL of your LazyCaptcha instance. */
    baseUrl?: string;
}

export interface LazyCaptchaRenderOptions {
    sitekey: string;
    type?: LazyCaptchaType;
    theme?: LazyCaptchaTheme;
    callback?: (token: string) => void;
    'expired-callback'?: () => void;
    'error-callback'?: (err: unknown) => void;
}

export interface LazyCaptchaGlobal {
    render(selectorOrEl: string | HTMLElement, options: LazyCaptchaRenderOptions): unknown;
    reset(selectorOrEl: string | HTMLElement): void;
    getToken(selectorOrEl: string | HTMLElement): string | null;
}

declare global {
    interface Window {
        LazyCaptcha?: LazyCaptchaGlobal;
    }
}
