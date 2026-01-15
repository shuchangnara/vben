import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { message } from 'ant-design-vue';

import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(
  options: GenerateMenuAndRoutesOptions & { appId?: string; global?: string },
) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1.5,
      });
      const response = await getAllMenusApi();

      // 调试：打印处理后的菜单数据
      // console.log('=== 处理后的菜单数据 ===');
      // console.log('菜单数量:', response.menus?.length);
      // console.log('菜单结构:', JSON.stringify(response.menus, null, 2));
      // console.log('权限数量:', response.permissions?.length);
      // console.log('权限列表:', response.permissions);
      // console.log('======================');

      // 保存用户权限代码到store
      if (response.permissions) {
        const { useAccessStore } = await import('@vben/stores');
        const accessStore = useAccessStore();
        accessStore.setAccessCodes(response.permissions);
      }

      return response.menus;
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
