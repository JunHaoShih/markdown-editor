import { boot } from 'quasar/wrappers';
import { Notify } from 'quasar';

Notify.registerType('success', {
  color: 'secondary',
  icon: 'check_circle',
});

Notify.registerType('error', {
  color: 'red',
  icon: 'error',
});

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  // something to do
});
