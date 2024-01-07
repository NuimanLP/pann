import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentPage.css';

const StudentPage = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  
  // Initialize state from localStorage if it exists or set default empty object
  const [viewedEvents, setViewedEvents] = useState(JSON.parse(localStorage.getItem('viewedEvents')) || {});
  const [submittedEvents, setSubmittedEvents] = useState(JSON.parse(localStorage.getItem('submittedEvents')) || {});

  useEffect(() => {
    axios.get('http://localhost:1337/api/events/studentRelated')
      .then(response => {
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

  useEffect(() => {
    // Update localStorage when viewedEvents changes
    localStorage.setItem('viewedEvents', JSON.stringify(viewedEvents));
  }, [viewedEvents]);

  useEffect(() => {
    // Update localStorage when submittedEvents changes
    localStorage.setItem('submittedEvents', JSON.stringify(submittedEvents));
  }, [submittedEvents]);

  const handleView = (id) => {
    setTimeout(() => {
      setViewedEvents(prevState => ({ ...prevState, [id]: true }));
    }, 3000); // Mark as viewed after 3 seconds
  };

  const handleSubmit = (id) => {
    setSubmittedEvents(prevState => ({ ...prevState, [id]: true }));
    // Implement the submission logic here
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
              <h3>{event.attributes.name}</h3>
              <p>{event.attributes.description}</p>
              {event.attributes.entries.data.map(entry => (
                <div key={entry.id}>
                  <span>Score: {entry.attributes.result}</span>
                </div>
              ))}
              <p>Created at: {new Date(event.attributes.dateTime).toLocaleString()}</p>
              <button onClick={() => handleSubmit(event.id)}>
                {submittedEvents[event.id] ? '✅' : 'Submit'}
              </button>
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
