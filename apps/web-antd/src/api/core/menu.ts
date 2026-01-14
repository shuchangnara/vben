import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

interface MenuResponse {
  menus: RouteRecordStringComponent[];
  permissions: string[];
  global?: string;
  appId?: string;
}

/**
 * 获取用户所有菜单和权限
 */
export async function getAllMenusApi(global?: string, appId?: string) {
  return requestClient.get<MenuResponse>('/menu/all', {
    params: {
      global,
      appId,
    },
  });
}
