'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::entry.entry', ({ strapi }) => ({
  async uploadScores(ctx) {


    const scoresData = ctx.request.body;
    console.log(ctx.state.user.id);
    console.log("Event Is Coming");
    // console.log(scoresData);


    // if (!ctx.state.user) {
    //   return ctx.badRequest('User must be authenticated');
    // }
    // // Validate the scores data
    // if (!scoresData || !Array.isArray(scoresData)) {
    //   ctx.badRequest('Invalid score data');
    // }
    //   // const entries = await strapi.entityService.findMany('api::entry.entry', {});
    
      let x  =''; 
      let score_owner = '';
    for (const scoreEntry of scoresData) {
      const{event:eventName,owner:studentscore_owner}= scoreEntry.data;
      x = eventName;
      score_owner= studentscore_owner;
      console.log("result"+x);
    }
      //Suthon
      const event_1 = await strapi.entityService.findMany('api::event.event', {//Go to See Event Cotentype[*Field*] 
        data:{
          name: x,//[Field in content type]
          owner: ctx.state.user

        }
      })
      // const entry_student_owner = await strapi.entityService.create('api::entry.entry', {//Go to See Event Cotentype[*Field*]
      //   data:{
      //     owner: Y,//[Field in content type]
      //     // seen_DateTime: new Date(),
      //   }})

    try {
      // Process each score entry
      for (const scoreEntry of scoresData) {
        console.log(scoreEntry);
        const {  result: result_entry, rating: rate,emo: emo } = scoreEntry.data;

        // Log the destructured scoreEntry
        console.log({result_entry, rate, emo });

        const allUsers = await strapi.entityService.findMany("plugin::users-permissions.user", {
          fields: ['username'],
          filters: {},
          sort: { username: 'asc' }, 
          populate: {}, 
        });
        console.log(allUsers); 
        const targetname = "นักเรียน_a";
        const realUser = allUsers.find(user => user.username === targetname);
        console.log(realUser);

        if (true) {
          // Create a new entry with the score
          await strapi.entityService.create('api::entry.entry', {
            populate: '*',
            data: {
              // @ts-ignore
              owner:realUser ,
              result: result_entry,
              event: event_1,
              seen_DateTime: new Date(),
              rating: rate,
              emotion: emo
            },
          });
        }
      }

      // Ensure the user is authenticated
      // const { user } = ctx.state.user;
      // Retrieve the scores data from the request body


      // // Validate the required fields in each score entry
      // if (!studentId || !eventId || score === undefined) {
      //   return ctx.badRequest('Missing studentId, eventId, or score in score entry');
      // }
      // if (entries.length) {
      //   // Update the entry with the new score
      //   await strapi.entityService.update('api::entry.entry', entries[0].id, {
      //     data: { result: result_entry },
      //   });
      // }
      // Find the corresponding entry for the student and event



      // Send a success response
      ctx.body = { "Hello": 'Scores uploaded successfully.' };
    } catch (error) {
      // Log and return an error response
      strapi.log.error('Upload scores error:', error);
      return ctx.internalServerError('Cannot process the request. Please try again');
    }
    console.log("complete");
  }
}));
