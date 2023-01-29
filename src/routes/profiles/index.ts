import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { NoRequiredEntity } from '../../utils/DB/errors/NoRequireEntity.error';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    ProfileEntity[]
  > {
    return fastify.db.profiles.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      let profile = await fastify.db.profiles.findOne({
        'key': 'id',
        'equals': request.params.id
      });
      if (profile) {
        return profile;
      } else {
        throw reply.notFound();
      };
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      let { userId, memberTypeId } = request.body;

      let existingProfile = await fastify.db.profiles.findOne({
        'key': 'userId',
        'equals': userId
      });
      if (existingProfile) {
        throw reply.badRequest();
      };

      let existingMemberType = await fastify.db.memberTypes.findOne({
        'key': 'id',
        'equals': memberTypeId
      });
      if (!existingMemberType) {
        throw reply.badRequest();
      };

      let created = fastify.db.profiles.create(request.body);
      return created;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        let deleted = await fastify.db.profiles.delete(request.params.id);
        return deleted;
      } catch (err) {
        if (err instanceof NoRequiredEntity) {
          throw reply.badRequest();
        };
        throw err;
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        let patched = await fastify.db.profiles.change(
          request.params.id, request.body
        );
        return patched;
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
