<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { loadLazyCaptchaScript } from './loader';
import type { LazyCaptchaProps } from './types';

const props = withDefaults(defineProps<LazyCaptchaProps>(), {
    type: 'auto',
    theme: 'auto',
    baseUrl: 'https://lazycaptcha.com',
});

const emit = defineEmits<{
    (e: 'verify', token: string): void;
    (e: 'expired'): void;
    (e: 'error', err: unknown): void;
    (e: 'load'): void;
}>();

const container = ref<HTMLDivElement | null>(null);
const widgetInstance = ref<unknown>(null);

async function mount() {
    if (!container.value) return;

    try {
        await loadLazyCaptchaScript(props.baseUrl);
    } catch (err) {
        emit('error', err);
        return;
    }

    if (!window.LazyCaptcha) {
        emit('error', new Error('LazyCaptcha global not available after script load'));
        return;
    }

    widgetInstance.value = window.LazyCaptcha.render(container.value, {
        sitekey: props.sitekey,
        type: props.type,
        theme: props.theme,
        callback: (token: string) => emit('verify', token),
        'expired-callback': () => emit('expired'),
        'error-callback': (err: unknown) => emit('error', err),
    });

    emit('load');
}

function reset() {
    if (container.value && window.LazyCaptcha) {
        window.LazyCaptcha.reset(container.value);
    }
}

function getToken(): string | null {
    if (container.value && window.LazyCaptcha) {
        return window.LazyCaptcha.getToken(container.value);
    }
    return null;
}

defineExpose({ reset, getToken });

onMounted(mount);

onBeforeUnmount(() => {
    // Widget cleans itself up when its container is removed from the DOM
    widgetInstance.value = null;
});

// If the sitekey changes, remount the widget
watch(() => props.sitekey, (next, prev) => {
    if (next !== prev && container.value) {
        container.value.innerHTML = '';
        mount();
    }
});
</script>

<template>
    <div ref="container" class="lazycaptcha-vue-root" />
</template>

<style scoped>
.lazycaptcha-vue-root {
    display: inline-block;
}
</style>
