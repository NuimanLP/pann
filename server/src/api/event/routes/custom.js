'use strict';

module.exports = {
    routes: [ //custom routes
        {
            method: 'POST',
            path: '/events/postEvent',
            handler: 'event.postEvent'
        },
        {
            method: 'GET',
            path: '/events/entries',
            handler: 'event.listEntries'
        },
        {
            method: 'GET',
            path: '/events/studentRelated',
            handler: 'event.listStudentRelated'
        }

    ]
}

