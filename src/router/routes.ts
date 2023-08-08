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
            path: '', component: () => import('pages/IndexPage.vue'),
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
    ],
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue'),
  },
  {
    path: '/editor',
    component: () => import('pages/EditorPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
