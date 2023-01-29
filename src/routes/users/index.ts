import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import { NoRequiredEntity } from '../../utils/DB/errors/NoRequireEntity.error';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return fastify.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      let user = await fastify.db.users.findOne({
        'key': 'id',
        'equals': request.params.id
      });
      return user!!;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      return fastify.db.users.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      return fastify.db.users.delete(request.params.id);
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      let { userId: subId } = request.body;
      let sub = await fastify.db.users.findOne({
        'key': 'id',
        'equals': subId
      });

      if (!sub) {
        throw reply.badRequest();
      };

      if (sub.subscribedToUserIds.includes(request.params.id)) {
        return sub;
      } else {
        return fastify.db.users.change(
          subId,
          {
            subscribedToUserIds: [...sub.subscribedToUserIds, request.params.id]
          }
        );
      };
  }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      let { userId: subId } = request.body;
      let sub = await fastify.db.users.findOne({
        'key': 'id',
        'equals': subId
      });

      if (!sub || !sub.subscribedToUserIds.includes(request.params.id)) {
        throw reply.badRequest();
      };

      return fastify.db.users.change(
        subId,
        {
          subscribedToUserIds: sub.subscribedToUserIds.filter(
            id => id !== request.params.id
          )
        }
      );
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        return fastify.db.users.change(request.params.id, request.body);
      } catch (err) {
        if (err instanceof NoRequiredEntity) {
          throw reply.badRequest();
        };
        throw err;
      };
    }
  );
};

export default plugin;
