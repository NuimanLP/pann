'use strict';

/**
 * entry controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const express = require('express');
const app = express();

// Body parsing middleware
app.use(express.json());



module.exports = createCoreController('api::entry.entry', ({ strapi }) => ({

    // Uploading scores
async uploadScores(ctx) {
  const { user } = ctx.state; 
  if (!user) {
    return ctx.unauthorized(`You must be logged in.`);
  }

  // Retrieve scoresData from the request body
  const scoresData = ctx.request.body;

  if (!scoresData || !Array.isArray(scoresData)) {
    ctx.throw(400, 'Invalid score data');
  }

  try {
    for (const scoreEntry of scoresData) {
      const { studentId, eventId, score } = scoreEntry;

      if (!studentId || !eventId || score === undefined) {
        ctx.throw(400, 'Missing studentId, eventId, or score in score entry');
      }

      // Find the student entry for the event
      const entries = await strapi.db.query('api::entry.entry').findMany({
        where: {
          owner: studentId, 
          event: eventId,
        },
      });

      if (entries.length) {
        const entry = entries[0];
        // Update the entry with the new score
        await strapi.services.entry.update({ id: entry.id }, { result: score });
      } else {
        // Handle the case where no entry is found
      }
    }

    return ctx.send('Scores uploaded successfully.');
  } catch (err) {
    console.error('Upload scores error:', err);
    ctx.throw(500, 'Cannot process the request. Please try again');
  }
}

      

}));
