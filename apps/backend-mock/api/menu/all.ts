import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_MENUS } from '~/utils/mock-data';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  // 获取请求参数
  const query = getQuery(event);
  const global = query.global as string;
  const appId = query.appId as string;

  const userMenus = MOCK_MENUS.find(
    (item) => item.username === userinfo.username,
  );

  if (!userMenus) {
    return useResponseSuccess({
      menus: [],
      permissions: [],
    });
  }

  // 返回完整菜单数据和用户拥有的权限代码，同时返回接收到的参数
  return useResponseSuccess({
    menus: userMenus.menus,
    permissions: userMenus.permissions || [],
    global,
    appId,
  });
});
