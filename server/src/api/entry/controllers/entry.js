'use strict';

// const { entries } = require('../../../../config/middlewares');
// const event = require('../../event/controllers/event');
// const entry = require('../services/entry');

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::entry.entry', ({ strapi }) => ({


  async seen(ctx) {
    const entityId = ctx.params.id;
    try {
        let item = await strapi.entityService.findOne("api::entry.entry", entityId, {
            populate: '*',
        });
        if (!item) {
            return ctx.notFound('Entry not found');
        }
        if (item.owner.id != ctx.state.user.id) {
            return ctx.unauthorized("Unmatch user and entry, seenDatetime cannot be updated");
        }
        await strapi.entityService.update("api::entry.entry", entityId, {
            data: {
                seen: 'Seen',
            }
        });
        ctx.body = { status: "Updated", message: "Entry marked as seen" };
    } catch (err) {
        ctx.throw(500, `Error marking entry as seen: ${err.message}`);
    }
},


 
  async submitEntry(ctx) {
    const eventId = ctx.params.id; 
    const studentId = ctx.state.user.id;
  
    console.log("Event ID:", eventId, "Student ID:", studentId);
  
    if (!eventId || !studentId) {
      return ctx.badRequest('Missing event ID or student ID');
    }
  
    try {
      // Find the entry corresponding to the student and event
      const entries = await strapi.entityService.findMany('api::entry.entry', {
        filters: {
          event: eventId,
          owner: studentId,
        },
      });
  
      if (entries.length === 0) {
        console.log("No entry found for Event ID:", eventId, "and Student ID:", studentId);
        return ctx.notFound('Entry not found');
      }
  
      const entryId = entries[0].id;
  
      // Updating the entry
      const updatedEntry = await strapi.entityService.update('api::entry.entry', entryId, {
        data: {
          act_DateTime: new Date(),
        },
      });
  
      console.log("Updated entry:", updatedEntry);
      // @ts-ignore
      return ctx.response.send(updatedEntry);
    } catch (error) {
      console.log("Error updating entry:", error);
      return ctx.internalServerError('Error updating entry');
    }
  }
  
,


async find(ctx) {
  const sanitizedQueryParams = await this.sanitizeQuery(ctx);

  const { results, pagination } = await strapi.service('api::entry.entry').find(sanitizedQueryParams);
  const sanitizedResults = await this.sanitizeOutput(results, ctx);

  return this.transformResponse(sanitizedResults, { pagination });

},

  async uploadScores(ctx) {
    // Get the scores data from the request body
    // @ts-ignore
    const scoresData = ctx.request.body;
    console.log(ctx.state.user.id);
    console.log("Event Is Coming");

    if (!ctx.state.user) {
      return ctx.badRequest('User must be authenticated');
    }
    // Validate the scores data
    if (!scoresData || !Array.isArray(scoresData)) {
      ctx.badRequest('Invalid score data');
    }

    try {
      for (const scoreEntry of scoresData) {

        // console.log(scoreEntry);
        const { owner: Studentowner, event: eventName, result: result_entry, rating: rate, emo: emo } = scoreEntry.data;

        console.log({ Studentowner, eventName, result_entry, rate, emo });


        const allUsers = await strapi.entityService.findMany("plugin::users-permissions.user", {
          fields: ['username'],
          filters: {},
          sort: { username: 'asc' },
          populate: {},
        });
        const targetname = Studentowner;
        const realUser = allUsers.find(user => user.username === targetname);


        const allevent = await strapi.entityService.findMany("api::event.event", {
          fields: ['name'],
          filters: {},
          sort: { name: 'asc' },
          populate: {},
        });
        console.log(allevent);
        const targetevent = eventName;
        const realEvent = allevent.find(event => event.name === targetevent);
        console.log(realEvent);

        if (true) {
          // Create a new entry with the score
          await strapi.entityService.create('api::entry.entry', {
            data: {
              // @ts-ignore
              owner: realUser,
              // @ts-ignore
              event: realEvent,
              result: result_entry,
              seen_DateTime: new Date(),
              rating: rate,
              emotion: emo
            },
          });
        }
      }
      ctx.body = { "Hello": 'Scores uploaded successfully.' };
    } catch (error) {
      // Log and return an error response
      strapi.log.error('Upload scores error:', error);
      return ctx.internalServerError('Cannot process the request. Please try again');
    }
    console.log("complete");
  }
}));