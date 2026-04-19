# @lazycaptcha/vue

Vue 3 component for [LazyCaptcha](https://lazycaptcha.com). Self-hostable, privacy-friendly CAPTCHA — drop-in alternative to hCaptcha and reCAPTCHA.

[![npm](https://img.shields.io/npm/v/@lazycaptcha/vue.svg)](https://npmjs.com/package/@lazycaptcha/vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @lazycaptcha/vue
# or
pnpm add @lazycaptcha/vue
# or
yarn add @lazycaptcha/vue
```

## Usage

### Component (Composition API)

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { LazyCaptcha } from '@lazycaptcha/vue';

const token = ref<string | null>(null);

async function onSubmit() {
    if (!token.value) {
        alert('Please complete the CAPTCHA');
        return;
    }
    await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ ..., 'lazycaptcha-token': token.value }),
    });
}
</script>

<template>
    <form @submit.prevent="onSubmit">
        <input v-model="email" type="email" required />
        <textarea v-model="message" required />

        <LazyCaptcha
            sitekey="YOUR_SITE_KEY"
            @verify="(t) => (token = t)"
            @expired="() => (token = null)"
        />

        <button type="submit" :disabled="!token">Send</button>
    </form>
</template>
```

### As a global plugin

```ts
// main.ts
import { createApp } from 'vue';
import { LazyCaptchaPlugin } from '@lazycaptcha/vue';
import App from './App.vue';

createApp(App).use(LazyCaptchaPlugin).mount('#app');
```

Now `<LazyCaptcha />` is available globally without importing.

### Composable

```vue
<script setup lang="ts">
import { useLazyCaptcha } from '@lazycaptcha/vue';

const { containerRef, token, reset } = useLazyCaptcha({
    sitekey: 'YOUR_SITE_KEY',
    type: 'auto',
    theme: 'light',
    onVerify: (t) => console.log('Got token:', t),
});
</script>

<template>
    <div ref="containerRef" />
    <button @click="reset">Reset</button>
</template>
```

### Template ref for programmatic control

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { LazyCaptcha } from '@lazycaptcha/vue';

const captcha = ref<InstanceType<typeof LazyCaptcha> | null>(null);

function onLogout() {
    captcha.value?.reset();
}
</script>

<template>
    <LazyCaptcha ref="captcha" sitekey="YOUR_SITE_KEY" @verify="onVerify" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sitekey` | `string` | **required** | Public site key (UUID) |
| `type` | `'auto' \| 'image_puzzle' \| 'pow' \| 'behavioral' \| 'text_math' \| 'press_hold' \| 'rotate_align'` | `'auto'` | Challenge type |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Widget theme. `'auto'` follows the host page's dark-mode class/attribute and the OS `prefers-color-scheme`. |
| `baseUrl` | `string` | `'https://lazycaptcha.com'` | Your LazyCaptcha instance |

## Events

| Event | Payload | When |
|-------|---------|------|
| `verify` | `token: string` | User successfully solved the challenge |
| `expired` | — | Token expired (5 min); user must resolve |
| `error` | `err: unknown` | Network / config error |
| `load` | — | Widget script + widget initialized |

## Server-side verification

The Vue component only handles the client-side widget. On your backend, verify the token with your secret key against `POST {baseUrl}/api/captcha/v1/verify`:

```ts
// Node.js example
const result = await fetch(`${baseUrl}/api/captcha/v1/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        secret: process.env.LAZYCAPTCHA_SECRET,
        token: req.body['lazycaptcha-token'],
        remote_ip: req.ip,
    }),
}).then(r => r.json());

if (!result.success) throw new Error('Captcha failed');
```

Official backend libraries are available for:
- Laravel (`lazycaptcha/laravel`)
- Django (`lazycaptcha-django`)
- Node.js, Rails, and more coming

## SSR / Nuxt

The component loads its underlying script client-side only. Use inside `<ClientOnly>` in Nuxt or render-only-on-mounted guards if needed:

```vue
<ClientOnly>
    <LazyCaptcha sitekey="YOUR_SITE_KEY" @verify="onVerify" />
</ClientOnly>
```

## License

[MIT](LICENSE)
