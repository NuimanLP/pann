'use strict';

/**
 * event controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::event.event', ({ strapi }) => ({
    async find(ctx) {
        const sanitizedQueryParams = await this.sanitizeQuery(ctx);
        if(!sanitizedQueryParams.filters){
            sanitizedQueryParams.filters = {}
        }
        sanitizedQueryParams.filters['owner'] = ctx.state.user.id

        const { results, pagination } = await strapi.service('api::event.event').find(sanitizedQueryParams);
        const sanitizedResults = await this.sanitizeOutput(results, ctx);

        return this.transformResponse(sanitizedResults, { pagination });
    },

    async create(ctx) {
        const event = await super.create(ctx)
        const updated = await strapi.entityService.update('api::event.event', event.data.id, {
            data: {
                owner: ctx.state.user.id
            }
        })
        return updated
    },

    async update(ctx) {
        const entityId = ctx.params.id;

        const event = await strapi.entityService.findOne('api::event.event', entityId, {
            populate: { owner: true },
        });

        if (!event) {
            return ctx.notFound(`Not Found`);
        }

        if (event.owner?.id !== ctx.state.user.id) {
            return ctx.unauthorized(`You can't update this entry`);
        }

        return await super.update(ctx);
    },

    async postEntries(ctx) {
        const entityId = ctx.params.id;
        try {
            ctx.body = { ok: 1 };
        } catch (err) {
            ctx.body = err;
        }
    },

    async listEntries(ctx) {
        const entityId = ctx.params.id;
        try {
            ctx.body = { ok: 1 };
        } catch (err) {
            ctx.body = err;
        }
    },

    async listStudentRelated(ctx) {
        try {
            const sanitizedQueryParams = await this.sanitizeQuery(ctx);
            sanitizedQueryParams.filters = sanitizedQueryParams.filters || {};
            sanitizedQueryParams.filters['owner'] = ctx.state.user.id;
    
            const { results, pagination } = await strapi.service('api::event.event').find(sanitizedQueryParams);
            const sanitizedResults = await this.sanitizeOutput(results, ctx);
    
            if (Array.isArray(sanitizedResults)) {
                for (const event of sanitizedResults) {
                    const entries = await strapi.service('api::entry.entry').find({
                        filters: {
                            event: event.id,
                            owner: ctx.state.user.id,
                        }
                    });
                    event.entries = entries.results;
                }
            }
    
            return this.transformResponse(sanitizedResults, { pagination });
        } catch (err) {
            ctx.throw(500, 'Internal server error');
        }
    }
    ,

})
);

