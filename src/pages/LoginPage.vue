<template>
  <div class="">
    <q-layout view="lHh lpr lFf">
      <q-header elevated>
        <q-toolbar class="bg-dark">
          <q-toolbar-title>
            Simple Manufacturing Process Manager
          </q-toolbar-title>
        </q-toolbar>
      </q-header>
      <q-page-container>
        <q-page padding class="row justify-center items-center">
          <div class="column">
            <div class="row">
              <h5 class="text-h5 q-my-md">Login</h5>
            </div>
            <div class="row">
              <q-card square bordered class="q-pa-lg shadow-1">
                <q-card-section>
                  <q-form class="q-gutter-md">
                    <q-input
                      ref="inputRef"
                      filled
                      v-model="username"
                      label="username"
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
                      label="password" style="width: 300px;"
                    >
                      <template v-if="password" v-slot:append>
                        <q-icon
                          name="cancel"
                          class="cursor-pointer"
                          @click.stop.prevent="password = ''"
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
                    label="Login" @click="onSubmit" />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/modules/firebase/stores/authStore';
import { ref } from 'vue';

const authStore = useAuthStore();

const username = ref('');

const password = ref('');

function onSubmit() {
  // authStore.googleLogin();
}
</script>
