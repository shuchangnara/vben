import { eventHandler, getQuery, readBody } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { MOCK_MENUS } from '~/utils/mock-data';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  // 获取请求参数（支持GET和POST）
  let global: string | undefined;
  let appId: string | undefined;

  if (event.method === 'GET') {
    const query = getQuery(event);
    global = query.global as string;
    appId = query.appId as string;
  } else if (event.method === 'POST') {
    const body = await readBody(event);
    global = body.data?.globalUserId;
    appId = body.data?.appId;
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

  // 返回完整菜单数据和用户拥有的权限代码，同时返回接收到的参数
  return useResponseSuccess({
    menus: userMenus.menus,
    permissions: userMenus.permissions || [],
    global,
    appId,
  });
});
