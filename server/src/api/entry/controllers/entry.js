'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::entry.entry', ({ strapi }) => ({

  async uploadScores(ctx) {
    // Get the scores data from the request body
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
        const { owner:Studentowner,event:eventName, result: result_entry, rating: rate,emo: emo } = scoreEntry.data;

        console.log({Studentowner,eventName,result_entry, rate, emo });

        
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
              owner:realUser,
              event: realEvent,
              result: result_entry,
              seen_DateTime:new Date(),
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