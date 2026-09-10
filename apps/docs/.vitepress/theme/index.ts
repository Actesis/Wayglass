import '@wayglass/tokens/tokens.css';
import DefaultTheme from 'vitepress/theme-without-fonts';

import './custom.css';
import Layout from './Layout.vue';

export default {
  ...DefaultTheme,
  Layout,
};
