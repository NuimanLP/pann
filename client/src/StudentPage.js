import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentPage.css';

const StudentPage = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  console.log('Token:', axiosConfig.jwt);

  useEffect(() => {
    axios.get('http://localhost:1337/api/events/studentRelated')
      .then(response => {
        setEvents(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
      });
  }, []);

  return (
    <div className="student-page">
      <h1>Welcome to the Student Page</h1>
      {error && <p className="error-message">{error}</p>}
      <div>
        <h2>Events</h2>
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} className="event">
              <h3>{event.name}</h3>
              <p>{event.description}</p>
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
