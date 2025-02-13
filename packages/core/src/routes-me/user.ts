import { emailRegEx, passwordRegEx, usernameRegEx } from '@logto/core-kit';
import type { UserProfileResponse } from '@logto/schemas';
import { userInfoSelectFields, arbitraryObjectGuard } from '@logto/schemas';
import { conditional, pick } from '@silverhand/essentials';
import { literal, object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { encryptUserPassword, verifyUserPassword } from '#src/libraries/user.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { convertCookieToMap } from '#src/utils/cookie.js';

import type { RouterInitArgs } from '../routes/types.js';
import type { AuthedMeRouter } from './types.js';

export default function userRoutes<T extends AuthedMeRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    queries: {
      users: { findUserById, updateUserById },
    },
    libraries: {
      users: { checkIdentifierCollision },
      verificationStatuses: { createVerificationStatus, checkVerificationStatus },
    },
  } = tenant;

  router.get('/', async (ctx, next) => {
    const { id: userId } = ctx.auth;

    const user = await findUserById(userId);

    const responseData: UserProfileResponse = {
      ...pick(user, ...userInfoSelectFields),
      ...conditional(user.passwordEncrypted && { hasPassword: Boolean(user.passwordEncrypted) }),
    };

    ctx.body = responseData;

    return next();
  });

  router.patch(
    '/',
    koaGuard({
      body: object({
        username: string().regex(usernameRegEx),
        primaryEmail: string().regex(emailRegEx),
        name: string().or(literal('')).nullable(),
        avatar: string().url().or(literal('')).nullable(),
      }).partial(),
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { body } = ctx.guard;

      const user = await findUserById(userId);
      assertThat(!user.isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

      await checkIdentifierCollision(body, userId);

      const updatedUser = await updateUserById(userId, body);
      ctx.body = pick(updatedUser, ...userInfoSelectFields);

      return next();
    }
  );

  router.get('/custom-data', async (ctx, next) => {
    const { id: userId } = ctx.auth;
    const user = await findUserById(userId);
    assertThat(!user.isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

    ctx.body = user.customData;

    return next();
  });

  router.patch(
    '/custom-data',
    koaGuard({
      body: arbitraryObjectGuard,
      response: arbitraryObjectGuard,
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { body: customData } = ctx.guard;

      const user = await findUserById(userId);
      assertThat(!user.isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

      const updatedUser = await updateUserById(userId, {
        customData,
      });

      ctx.body = updatedUser.customData;

      return next();
    }
  );

  router.post(
    '/password/verify',
    koaGuard({
      body: object({ password: string() }),
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { password } = ctx.guard.body;
      const cookieMap = convertCookieToMap(ctx.request.headers.cookie);
      const sessionId = cookieMap.get('_session');

      assertThat(sessionId, new RequestError({ code: 'session.not_found', status: 401 }));

      const user = await findUserById(userId);
      assertThat(!user.isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

      await verifyUserPassword(user, password);

      await createVerificationStatus(userId, sessionId);

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/password',
    koaGuard({ body: object({ password: string().regex(passwordRegEx) }) }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { password } = ctx.guard.body;

      const { isSuspended, passwordEncrypted: oldPasswordEncrypted } = await findUserById(userId);

      assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

      const cookieMap = convertCookieToMap(ctx.request.headers.cookie);
      const sessionId = cookieMap.get('_session');

      assertThat(sessionId, new RequestError({ code: 'session.not_found', status: 401 }));

      if (oldPasswordEncrypted) {
        await checkVerificationStatus(userId, sessionId);
      }

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);
      await updateUserById(userId, { passwordEncrypted, passwordEncryptionMethod });

      ctx.status = 204;

      return next();
    }
  );
}
