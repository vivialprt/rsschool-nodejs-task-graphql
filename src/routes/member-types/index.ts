import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';
import { NoRequiredEntity } from '../../utils/DB/errors/NoRequireEntity.error';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    return fastify.db.memberTypes.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      let memberType = await fastify.db.memberTypes.findOne({
        'key': 'id',
        'equals': request.params.id
      });
      if (memberType) {
        return memberType;
      } else {
        throw reply.notFound();
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      try {
        let patched = await fastify.db.memberTypes.change(
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
