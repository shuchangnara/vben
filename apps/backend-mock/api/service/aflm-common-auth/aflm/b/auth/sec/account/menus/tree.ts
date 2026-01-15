import { eventHandler, getQuery, readBody } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_MENUS } from '~/utils/mock-data';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  // 获取请求参数（支持GET和POST）- 参数已不再使用，仅用于兼容性
  if (event.method === 'GET') {
    getQuery(event);
  } else if (event.method === 'POST') {
    await readBody(event);
  }

  const userMenus = MOCK_MENUS.find(
    (item) => item.username === userinfo.username,
  );

  if (!userMenus) {
    return useResponseSuccess({
      menus: [],
      permissions: [],
    });
  }

  // 返回简化菜单数据（移除meta和path字段，只保留必要字段）
  const simplifiedMenus = userMenus.menus.map((menu) => ({
    name: menu.name,
    menusCode: menu.menusCode,
    structureMenusChildList: menu.structureMenusChildList?.map((child) => ({
      name: child.name,
      menusCode: child.menusCode,
      structureMenusChildList: child.structureMenusChildList,
    })),
  }));

  return useResponseSuccess(simplifiedMenus);
});
