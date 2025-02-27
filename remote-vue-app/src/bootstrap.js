import { createApp } from 'vue';
import VueApp from './App.vue';

const mount = el => {
  const app = createApp(VueApp);
  app.mount(el);
  return app;
};

export { mount };