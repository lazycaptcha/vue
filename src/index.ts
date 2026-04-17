import type { App } from 'vue';
import LazyCaptcha from './LazyCaptcha.vue';

export { LazyCaptcha };
export { useLazyCaptcha } from './useLazyCaptcha';
export { loadLazyCaptchaScript } from './loader';
export type {
    LazyCaptchaProps,
    LazyCaptchaType,
    LazyCaptchaTheme,
    LazyCaptchaRenderOptions,
    LazyCaptchaGlobal,
} from './types';

/**
 * Vue plugin installer: `app.use(LazyCaptchaPlugin)` registers
 * the component globally as <LazyCaptcha />.
 */
export const LazyCaptchaPlugin = {
    install(app: App) {
        app.component('LazyCaptcha', LazyCaptcha);
    },
};

export default LazyCaptcha;
