import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { AsgardeoPlugin } from '@asgardeo/vue';

const app = createApp(App);
app.use(AsgardeoPlugin);
app.use(router);
app.mount('#app');
