import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentPage.css';

const StudentPage = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  // track of viewed and submit events
  const [viewedEvents, setViewedEvents] = useState({});
  const [submittedEvents, setSubmittedEvents] = useState({});

  useEffect(() => {
    axios.get('http://localhost:1337/api/events/studentRelated')
      .then(response => {
        // Sort the events by date in descend order
        const sortedEvents = response.data.data.sort((a, b) =>
          new Date(b.attributes.dateTime) - new Date(a.attributes.dateTime)
        );
        setEvents(sortedEvents);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
      });
  }, []);

  const handleView = (id) => {
    // Automatically tick the view 
    setTimeout(() => {
      setViewedEvents(prevState => ({ ...prevState, [id]: true }));
    }, 3000);
  };

  const handleSubmit = (id) => {
    // Mark the event as submitted
    setSubmittedEvents(prevState => ({ ...prevState, [id]: true }));
    // TODO: Implement the submission logic, e.g., sending data to the server
  };

  return (
    <div className="student-page">
      <h1>Welcome to the Student Page</h1>
      {error && <p className="error-message">{error}</p>}
      <div>
        <h2>Events</h2>
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} className="event">
              <h3>{event.attributes.name}</h3> {/* Display the event name */}
              <p>{event.attributes.description}</p> {/* Display the event description */}
              {/* Display the score for each student id that is related to the event */}
              {event.attributes.entries.data.map(entry => (
                <div key={entry.id}>
                  <span>Score: {entry.attributes.result}</span>
                </div>
              ))}
              <p>Created at: {new Date(event.attributes.dateTime).toLocaleString()}</p>
              {/* Summit button */}
              <button onClick={() => handleSubmit(event.id)}>
                {submittedEvents[event.id] ? '✅' : 'Submit'}
              </button>
              {/* View button */}
              <button onClick={() => handleView(event.id)} disabled={viewedEvents[event.id]}>
                {viewedEvents[event.id] ? '👌' : 'View'}
              </button>
            </div>
          ))
        ) : (
          <p>No events to display.</p>
        )}
      </div>
    </div>
  );
};

export default StudentPage;
