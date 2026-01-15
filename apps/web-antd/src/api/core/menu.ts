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
  menusCode?: string | string[]; // 外层的权限字段（替换permission），支持数组格式
  permission?: string; // 兼容旧字段
  authCode?: string;
  status?: number;
  type?: string;
  [key: string]: any;
}

// 接口响应类型已不再使用，直接处理响应数据

/**
 * 检查权限码是否在菜单树中存在
 */
function hasPermissionInMenuTree(
  permissionCode: string,
  menuTree: any[],
): boolean {
  const traverseMenu = (menu: any): boolean => {
    // 检查当前菜单的权限码
    const menuPermission = menu.menusCode || menu.permission || menu.authCode;
    if (menuPermission) {
      if (Array.isArray(menuPermission)) {
        if (menuPermission.includes(permissionCode)) {
          return true;
        }
      } else if (menuPermission === permissionCode) {
        return true;
      }
    }

    // 递归检查子菜单
    const childMenus = menu.children || menu.structureMenusChildList;
    if (childMenus && childMenus.length > 0) {
      for (const childMenu of childMenus) {
        if (traverseMenu(childMenu)) {
          return true;
        }
      }
    }

    return false;
  };

  for (const menu of menuTree) {
    if (traverseMenu(menu)) {
      return true;
    }
  }

  return false;
}

/**
 * 基于本地路由和菜单树过滤有权限的路由
 */
function filterAccessibleRoutes(localRoutes: any[], menuTree: any[]): any[] {
  const traverseRoutes = (routes: any[]): any[] => {
    return routes.filter((route) => {
      // 获取路由的权限码（从本地路由的meta.permission获取）
      const routePermission = route.meta?.permission;

      // 如果没有权限码要求，默认允许访问
      if (!routePermission) {
        return true;
      }

      // 检查权限码是否在菜单树中存在
      const hasPermission = hasPermissionInMenuTree(routePermission, menuTree);

      // 递归处理子路由
      if (route.children && route.children.length > 0) {
        route.children = traverseRoutes(route.children);
      }

      return hasPermission;
    });
  };

  return traverseRoutes(localRoutes);
}

/**
 * 递归从菜单数据中提取权限代码
 */
function extractPermissionsFromMenus(menus: any[]): string[] {
  const permissions: string[] = [];

  const traverseMenu = (menu: any) => {
    // 提取当前菜单的权限代码
    const permissionCode = menu.menusCode || menu.permission || menu.authCode;
    if (permissionCode) {
      if (Array.isArray(permissionCode)) {
        permissions.push(...permissionCode);
      } else {
        permissions.push(permissionCode);
      }
    }

    // 递归处理子菜单
    const childMenus = menu.children || menu.structureMenusChildList;
    if (childMenus && childMenus.length > 0) {
      for (const childMenu of childMenus) {
        traverseMenu(childMenu);
      }
    }
  };

  for (const menu of menus) {
    traverseMenu(menu);
  }
  return permissions;
}

/**
 * 转换实际菜单数据为Vue Router格式（简化版，只提取权限信息）
 */
function convertMenuData(menuData: any): any[] {
  // 调试：打印传入的数据结构
  console.warn('=== convertMenuData 输入数据 ===');
  console.warn('类型:', typeof menuData);
  console.warn('是数组:', Array.isArray(menuData));
  console.warn('数据结构:', JSON.stringify(menuData, null, 2));

  // 如果返回的是完整的接口响应对象（包含code、data等字段）
  if (menuData && typeof menuData === 'object' && menuData.data !== undefined) {
    console.warn('处理完整接口响应对象');
    // 递归处理data字段
    return convertMenuData(menuData.data);
  }

  // 如果返回的是包含menus字段的对象
  if (menuData.menus && Array.isArray(menuData.menus)) {
    console.warn('处理包含menus字段的对象');
    return menuData.menus;
  }

  // 如果直接返回菜单数组
  if (Array.isArray(menuData)) {
    console.warn('处理直接返回的菜单数组');
    return menuData;
  }

  console.warn('无法识别的菜单数据结构:', menuData);
  return [];
}

// convertActualMenuToRoute 函数已不再使用，因为meta字段已迁移到本地路由定义

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

  const response = await requestClient.post<any>(
    '/api/service/aflm-common-auth/aflm/b/auth/sec/account/menus/tree',
    {
      data: {
        globalUserId,
        appId: 'zk-background-management',
      },
    },
  );

  // 新的接口直接返回菜单数组，需要从response.data中获取
  const menuData = response.data || response;

  // 调试：打印原始菜单数据
  console.warn('=== 原始菜单数据 ===');
  console.warn('原始数据:', JSON.stringify(menuData, null, 2));

  // 转换菜单数据
  const convertedMenus = convertMenuData(menuData);

  // 调试：打印转换后的菜单数据
  console.warn('=== 转换后的菜单数据 ===');
  console.warn('转换后数据:', JSON.stringify(convertedMenus, null, 2));

  // 递归从菜单数据中提取权限代码
  const permissions = extractPermissionsFromMenus(convertedMenus);

  // 调试：打印提取的权限
  console.warn('=== 提取的权限 ===');
  console.warn('权限列表:', permissions);

  // 导入本地路由表
  const { accessRoutes } = await import('#/router/routes');

  // 基于本地路由和菜单树过滤有权限的路由
  const accessibleRoutes = filterAccessibleRoutes(accessRoutes, convertedMenus);

  // 调试：打印过滤后的路由
  console.warn('=== 过滤后的本地路由 ===');
  console.warn('本地路由数量:', accessRoutes.length);
  console.warn('有权限的路由数量:', accessibleRoutes.length);
  console.warn('有权限的路由:', JSON.stringify(accessibleRoutes, null, 2));
  console.warn('======================');

  // 返回有权限的本地路由和权限代码
  return {
    menus: accessibleRoutes,
    permissions,
  };
}
