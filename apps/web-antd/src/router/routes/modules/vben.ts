import type { RouteRecordRaw } from 'vue-router';

import {
  VBEN_DOC_URL,
  VBEN_ELE_PREVIEW_URL,
  VBEN_GITHUB_URL,
  VBEN_LOGO_URL,
  VBEN_NAIVE_PREVIEW_URL,
  VBEN_TD_PREVIEW_URL,
} from '@vben/constants';
import { SvgTDesignIcon } from '@vben/icons';

// IFrameView组件将通过动态导入使用
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      badgeType: 'dot',
      icon: VBEN_LOGO_URL,
      order: 9998,
      title: $t('demos.vben.title'),
      permission: ['VBEN_PROJECT_VIEW'],
    },
    name: 'VbenProject',
    path: '/vben-admin',
    children: [
      {
        name: 'VbenDocument',
        path: '/vben-admin/document',
        component: () => import('@vben/layouts').then((m) => m.IFrameView),
        meta: {
          icon: 'lucide:book-open-text',
          link: VBEN_DOC_URL,
          title: $t('demos.vben.document'),
          permission: ['VBEN_DOCUMENT_VIEW'],
        },
      },
      {
        name: 'VbenGithub',
        path: '/vben-admin/github',
        component: () => import('@vben/layouts').then((m) => m.IFrameView),
        meta: {
          icon: 'mdi:github',
          link: VBEN_GITHUB_URL,
          title: 'Github',
          permission: ['VBEN_GITHUB_VIEW'],
        },
      },
      {
        name: 'VbenNaive',
        path: '/vben-admin/naive',
        component: () => import('@vben/layouts').then((m) => m.IFrameView),
        meta: {
          badgeType: 'dot',
          icon: 'logos:naiveui',
          link: VBEN_NAIVE_PREVIEW_URL,
          title: $t('demos.vben.naive-ui'),
          permission: ['VBEN_NAIVE_VIEW'],
        },
      },
      {
        name: 'VbenTDesign',
        path: '/vben-admin/tdesign',
        component: () => import('@vben/layouts').then((m) => m.IFrameView),
        meta: {
          badgeType: 'dot',
          icon: SvgTDesignIcon,
          link: VBEN_TD_PREVIEW_URL,
          title: $t('demos.vben.tdesign'),
          permission: ['VBEN_TDESIGN_VIEW'],
        },
      },
      {
        name: 'VbenElementPlus',
        path: '/vben-admin/ele',
        component: () => import('@vben/layouts').then((m) => m.IFrameView),
        meta: {
          badgeType: 'dot',
          icon: 'logos:element',
          link: VBEN_ELE_PREVIEW_URL,
          title: $t('demos.vben.element-plus'),
          permission: ['VBEN_ELEMENT_PLUS_VIEW'],
        },
      },
    ],
  },
  {
    name: 'VbenAbout',
    path: '/vben-admin/about',
    component: () => import('#/views/_core/about/index.vue'),
    meta: {
      icon: 'lucide:copyright',
      title: $t('demos.vben.about'),
      order: 9999,
      permission: ['VBEN_ABOUT_VIEW'],
    },
  },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      icon: 'lucide:user',
      hideInMenu: true,
      title: $t('page.auth.profile'),
      permission: ['PROFILE_VIEW'],
    },
  },
];

export default routes;
