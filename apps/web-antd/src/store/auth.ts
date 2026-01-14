import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { getAccessCodesApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const loginResult = await loginApi(params);

      // 如果成功获取到 zuulToken
      if (loginResult.zuulToken) {
        accessStore.setAccessToken(loginResult.zuulToken);

        // 从登录响应中获取用户信息（不包含密码）
        const {
          zuulToken: _,
          globaluserId: __,
          ...userInfoFromLogin
        } = loginResult;
        userInfo = userInfoFromLogin as UserInfo;

        // 存储用户信息到 localStorage
        localStorage.setItem('user_info', JSON.stringify(userInfo));
        userStore.setUserInfo(userInfo);

        // 获取权限代码
        const accessCodes = await getAccessCodesApi();
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }

    // 清除 localStorage 中的用户信息
    localStorage.removeItem('user_info');

    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;

    // 从 localStorage 获取用户信息
    const storedUserInfo = localStorage.getItem('user_info');
    if (storedUserInfo) {
      userInfo = JSON.parse(storedUserInfo) as UserInfo;
      userStore.setUserInfo(userInfo);
    } else {
      // 如果 localStorage 中没有用户信息，说明用户未登录或会话已过期
      // 直接跳转到登录页面
      await router.replace({
        path: LOGIN_PATH,
        query: {
          redirect: encodeURIComponent(router.currentRoute.value.fullPath),
        },
      });
      throw new Error('用户未登录或会话已过期');
    }

    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
