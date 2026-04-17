import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import LazyCaptcha from '../src/LazyCaptcha.vue';

describe('<LazyCaptcha>', () => {
    let renderSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        renderSpy = vi.fn();
        // Stub script loader — skip real network fetch
        (window as any).LazyCaptcha = {
            render: renderSpy,
            reset: vi.fn(),
            getToken: vi.fn(() => 'mock-token'),
        };
    });

    it('renders a root element', () => {
        const wrapper = mount(LazyCaptcha, {
            props: { sitekey: 'test-key' },
        });
        expect(wrapper.find('.lazycaptcha-vue-root').exists()).toBe(true);
    });

    it('calls LazyCaptcha.render on mount with the configured sitekey', async () => {
        mount(LazyCaptcha, {
            props: { sitekey: 'my-key', type: 'image_puzzle', theme: 'dark' },
        });

        await nextTick();
        await new Promise((r) => setTimeout(r, 0));

        expect(renderSpy).toHaveBeenCalled();
        const [, opts] = renderSpy.mock.calls[0];
        expect(opts.sitekey).toBe('my-key');
        expect(opts.type).toBe('image_puzzle');
        expect(opts.theme).toBe('dark');
    });

    it('emits "verify" when the widget calls its callback', async () => {
        renderSpy.mockImplementation((_el, opts: any) => {
            // Simulate successful solve
            opts.callback?.('token-abc');
        });

        const wrapper = mount(LazyCaptcha, {
            props: { sitekey: 'test' },
        });

        await nextTick();
        await new Promise((r) => setTimeout(r, 0));

        expect(wrapper.emitted('verify')).toBeTruthy();
        expect(wrapper.emitted('verify')?.[0]).toEqual(['token-abc']);
    });
});
