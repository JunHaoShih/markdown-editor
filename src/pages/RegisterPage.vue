<template>
  <div class="">
    <q-layout view="lHh lpr lFf">
      <q-header elevated>
        <title-bar title="Markdown Editor">
        </title-bar>
      </q-header>
      <q-page-container>
        <q-page padding class="row justify-center items-center">
          <div class="column">
            <div class="row">
              <h5 class="text-h5 q-my-md">{{ $t('actions.register') }}</h5>
            </div>
            <div class="row">
              <q-card square bordered class="q-pa-lg shadow-1">
                <q-card-section>
                  <q-form class="q-gutter-md">
                    <q-input
                      filled
                      v-model="username"
                      type="email"
                      :label="$t('email')"
                      style="width: 300px;"
                    >
                      <template v-if="username" v-slot:append>
                        <q-icon
                          name="cancel"
                          class="cursor-pointer"
                          @click.stop.prevent="username = ''"
                        />
                      </template>
                    </q-input>
                    <q-input
                      filled
                      v-model="password"
                      type="password"
                      v-on:keyup.enter="onSubmit"
                      :label="$t('password')"
                      style="width: 300px;"
                    >
                      <template v-if="password" v-slot:append>
                        <q-icon
                          name="cancel"
                          class="cursor-pointer"
                          @click.stop.prevent="password = ''"
                        />
                      </template>
                    </q-input>
                    <q-input
                      filled
                      v-model="displayName"
                      type="text"
                      :label="$t('displayName')"
                      style="width: 300px;"
                    >
                      <template v-if="displayName" v-slot:append>
                        <q-icon
                          name="cancel"
                          class="cursor-pointer"
                          @click.stop.prevent="displayName = ''"
                        />
                      </template>
                    </q-input>
                  </q-form>
                </q-card-section>
                <q-card-actions class="q-px-md">
                  <q-btn
                    push
                    color="secondary"
                    size="lg"
                    class="full-width"
                    :label="$t('actions.register')"
                    @click="onSubmit"
                  />
                </q-card-actions>
                <q-card-section class="text-center q-pa-none">
                  <p class="text-grey-6">
                    {{ $t('registerPage.loginHint') }}
                    <a href="/login">{{ $t('registerPage.login') }}</a>
                  </p>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup lang="ts">
import { auth } from 'src/boot/firebase';
import TitleBar from 'src/components/TitleBar.vue';
import { useAuthStore } from 'src/modules/firebase/stores/authStore';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const authStore = useAuthStore();

const username = ref('');

const password = ref('');

const displayName = ref('');

async function onSubmit() {
  const success = await authStore.register(username.value, password.value, displayName.value);
  if (success) {
    router.replace('/');
  }
}

auth.onAuthStateChanged((user) => {
  if (user) {
    router.replace('/');
  }
});
</script>
