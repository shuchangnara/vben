import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

// 实际接口可能返回的数据结构
interface ActualMenuData {
  id: number;
  name: string;
  path: string;
  component?: string;
  meta?: any;
  children?: ActualMenuData[];
  structureMenusChildList?: ActualMenuData[]; // 新的子菜单属性名
  redirect?: string;
  pid?: number;
  authCode?: string;
  status?: number;
  type?: string;
  [key: string]: any;
}

interface MenuResponse {
  menus: RouteRecordStringComponent[];
  permissions: string[];
  global?: string;
  appId?: string;
  data?: any; // 实际接口可能直接返回数据数组
}

/**
 * 转换实际菜单数据为Vue Router格式
 */
function convertMenuData(menuData: any): RouteRecordStringComponent[] {
  // 如果已经是标准格式，直接返回
  if (
    Array.isArray(menuData) &&
    menuData.length > 0 &&
    menuData[0].name &&
    menuData[0].path
  ) {
    return menuData;
  }

  // 如果接口返回的是data字段
  if (menuData.data && Array.isArray(menuData.data)) {
    return convertActualMenuToRoute(menuData.data);
  }

  // 如果直接返回数组
  if (Array.isArray(menuData)) {
    return convertActualMenuToRoute(menuData);
  }

  // 如果返回的是包含menus字段的对象
  if (menuData.menus && Array.isArray(menuData.menus)) {
    return convertActualMenuToRoute(menuData.menus);
  }

  console.warn('无法识别的菜单数据结构:', menuData);
  return [];
}

/**
 * 将实际菜单数据转换为Vue Router格式
 */
function convertActualMenuToRoute(
  menus: ActualMenuData[],
): RouteRecordStringComponent[] {
  return menus.map((menu) => {
    const route: any = {
      name: menu.name || `menu_${menu.id}`,
      path: menu.path,
      meta: {
        ...menu.meta,
        title: menu.meta?.title || menu.name,
        permission: menu.authCode || menu.meta?.permission,
      },
    };

    // 处理组件路径
    if (menu.component) {
      route.component = menu.component;
    }

    // 处理重定向
    if (menu.redirect) {
      route.redirect = menu.redirect;
    }

    // 递归处理子菜单 - 支持children和structureMenusChildList两种属性名
    const childMenus = menu.children || menu.structureMenusChildList;
    if (childMenus && childMenus.length > 0) {
      route.children = convertActualMenuToRoute(childMenus);
    }

    return route;
  });
}

/**
 * 获取用户所有菜单和权限
 */
export async function getAllMenusApi() {
  // 从cookie中获取globalUserId
  function getCookie(name: string): null | string {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  const globalUserId = getCookie('globalUserId');

  const response = await requestClient.post<MenuResponse>(
    '/api/service/aflm-common-auth/aflm/b/auth/sec/account/menus/tree',
    {
      data: {
        globalUserId,
        appId: 'zk-background-management',
      },
    },
  );

  // 转换菜单数据
  const convertedMenus = convertMenuData(response);

  // 返回转换后的数据，保持原有结构
  return {
    ...response,
    menus: convertedMenus,
  };
}
