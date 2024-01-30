import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CSS/StudentPage.css';
import axiosConfig from '../axios-interceptor'; // Import axiosConfig for authorization

const StudentPage = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Initialize state from localStorage if it exists or set default empty object
  const [viewedEvents, setViewedEvents] = useState(JSON.parse(sessionStorage.getItem('viewedEvents')) || {});
  const [submittedEvents, setSubmittedEvents] = useState(JSON.parse(localStorage.getItem('submittedEvents')) || {});

  useEffect(() => {
    axios.get('http://localhost:1337/api/events/studentRelated', {
      headers: {
        Authorization: `Bearer ${axiosConfig.jwt}`, // Authorization header
      },
    })
      .then(response => {
        // Sort the events by date in descending order
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
    sessionStorage.setItem('viewedEvents', JSON.stringify(viewedEvents));
  }, [viewedEvents]);

  useEffect(() => {
    sessionStorage.setItem('submittedEvents', JSON.stringify(submittedEvents));
  }, [submittedEvents]);

  const handleView = (id) => {
    setTimeout(() => {
      setViewedEvents(prevState => ({ ...prevState, [id]: true }));
    }, 3000); // Mark as viewed after 3 seconds
  };

  const handleLogout = () => {
    window.location.href = 'http://localhost:3000/';
  };

  const handleSubmit = async (id) => {
    try {
      // Example POST request to submit an event
      await axios.post(`http://localhost:1337/api/events/submit/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${axiosConfig.jwt}`, // Authorization header
        },
      });
      setSubmittedEvents(prevState => ({ ...prevState, [id]: true }));
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };
  // Filter events based on search term
  const filteredEvents = searchTerm
    ? events.filter(event =>
      event.attributes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.attributes.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : events;



  return (
    <div className="student-page">
      <h1>Welcome to the Student Page</h1>
      <input
        type="text"
        placeholder="Search events..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      {error && <p className="error-message">{error}</p>}
      <div>
        <h2>Events</h2>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
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
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};


export default StudentPage;
