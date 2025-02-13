import { readFile } from 'fs/promises';

import { generateStandardId } from '@logto/core-kit';
import { format } from 'date-fns';
import { object } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import {
  allowUploadMimeTypes,
  maxUploadFileSize,
  uploadFileGuard,
} from '#src/utils/storage/consts.js';
import { buildUploadFile } from '#src/utils/storage/index.js';
import { getTenantId } from '#src/utils/tenant.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function userAssetsRoutes<T extends AuthedRouter>(...[router]: RouterInitArgs<T>) {
  router.get('/user-assets/service-status', async (ctx, next) => {
    const { storageProviderConfig } = SystemContext.shared;

    ctx.body = storageProviderConfig
      ? {
          status: 'ready',
          allowUploadMimeTypes,
          maxUploadFileSize,
        }
      : {
          status: 'not_configured',
        };

    return next();
  });

  router.post(
    '/user-assets',
    koaGuard({
      files: object({
        file: uploadFileGuard,
      }),
    }),
    async (ctx, next) => {
      const { file } = ctx.guard.files;

      assertThat(file.size <= maxUploadFileSize, 'guard.file_size_exceeded');
      assertThat(allowUploadMimeTypes.includes(file.mimetype), 'guard.mime_type_not_allowed');

      const tenantId = getTenantId(ctx.URL);
      assertThat(tenantId, 'guard.can_not_get_tenant_id');

      const { storageProviderConfig } = SystemContext.shared;
      assertThat(storageProviderConfig, 'storage.not_configured');

      const userId = ctx.auth.id;
      const uploadFile = buildUploadFile(storageProviderConfig);
      const objectKey = `${tenantId}/${userId}/${format(
        new Date(),
        'yyyy/MM/dd'
      )}/${generateStandardId(8)}/${file.originalFilename}`;

      try {
        const { url } = await uploadFile(await readFile(file.filepath), objectKey, {
          contentType: file.mimetype,
          publicUrl: storageProviderConfig.publicUrl,
        });

        ctx.body = {
          url,
        };
      } catch {
        throw new RequestError('storage.upload_error');
      }

      return next();
    }
  );
}
