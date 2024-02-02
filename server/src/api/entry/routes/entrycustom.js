'use strict';

module.exports = {
    "routes": [
        {
          "method": "POST",
          "path": "/entries/upload-scores",
          "handler": "entry.uploadScores",
        },
        {
        "method": 'POST',
        "path": '/entries/submit/:id',
        "handler": 'entry.submitEntry',
        },
        {
          "method": "POST",
          "path": "/entries/:id/seen",
          "handler": "entry.seen",
          },
        
      
      ]
}

