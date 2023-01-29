import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';
import { NoRequiredEntity } from '../../utils/DB/errors/NoRequireEntity.error';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return fastify.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      let post = await fastify.db.posts.findOne({
        'key': 'id',
        'equals': request.params.id
      });
      if (post) {
        return post;
      } else {
        throw reply.notFound();
      };
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      return fastify.db.posts.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        let deleted = await fastify.db.posts.delete(
          request.params.id
        );
        return deleted;
      } catch (err) {
        if (err instanceof NoRequiredEntity) {
          throw reply.badRequest();
        };
        throw err;
      };
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        let patched = await fastify.db.posts.change(
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
