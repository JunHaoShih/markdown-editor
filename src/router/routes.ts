import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '', component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'workspace',
        component: () => import('pages/WorkspacePage.vue'),
        props: true,
        children: [
          {
            path: '', component: () => import('pages/workspace/IndexPage.vue'),
          },
          {
            path: ':id', component: () => import('pages/workspace/MarkdownPage.vue'), props: true,
          },
        ],
      },
      {
        path: 'trashBin',
        component: () => import('pages/trashBin/TrashBinPage.vue'),
        props: true,
      },
      {
        path: 'diagram', component: () => import('pages/diagram/DiagramPage.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      {
        path: '', component: () => import('pages/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/register',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      {
        path: '', component: () => import('pages/RegisterPage.vue'),
      },
    ],
  },
  {
    path: '/verifying',
    component: () => import('layouts/VerifyingLayout.vue'),
    children: [
      {
        path: '', component: () => import('pages/VerifyingPage.vue'),
      },
    ],
  },
  {
    path: '/editor',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      {
        path: '', component: () => import('pages/EditorPage.vue'),
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: 'google', component: () => import('pages/auth/GoogleAuthPage.vue'),
      },
    ],
    redirect: '/',
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
