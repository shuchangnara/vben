import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

interface MenuResponse {
  menus: RouteRecordStringComponent[];
  permissions: string[];
}

/**
 * 获取用户所有菜单和权限
 */
export async function getAllMenusApi() {
  return requestClient.get<MenuResponse>('/menu/all');
}
