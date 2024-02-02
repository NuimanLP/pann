import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CSS/StudentPage.css';

const StudentPage = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const jwt = sessionStorage.getItem('jwt');
  const user = sessionStorage.getItem('user'); 
  // const role = sessionStorage.getItem('role');

  // Setup axios headers for all requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;

  const [submittedEvents, setSubmittedEvents] = useState(JSON.parse(localStorage.getItem('submittedEvents')) || {});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:1337/api/events/studentRelated', {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const sortedEvents = response.data.data.sort((a, b) => new Date(b.attributes.dateTime) - new Date(a.attributes.dateTime));
        setEvents(sortedEvents);
      } catch (error) {
        setError('Failed to load events. Please try again later.');
      }
    };
    fetchEvents();
  }, [jwt]);

  const handleLogout = () => {
    // Clear session storage on logout
    sessionStorage.clear();
    window.location.href = '/';
  };

  const handleSubmit = async (id) => {
    try {
      const response = await axios.post(`http://localhost:1337/api/entries/submit/${id}`, {}, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setSubmittedEvents(prev => ({ ...prev, [id]: true }));
    } catch (error) {
      setError('Failed to submit event. Please try again.');
    }
  };

  // Filter events based on search term
  const filteredEvents = searchTerm ? events.filter(event => event.attributes.name.toLowerCase().includes(searchTerm.toLowerCase()) || event.attributes.description.toLowerCase().includes(searchTerm.toLowerCase())) : events;

  useEffect(() => {
    localStorage.setItem('submittedEvents', JSON.stringify(submittedEvents));
  }, [submittedEvents]);

  return (
    <div className="student-page">
      <h1>Welcome {user} to the Student Page</h1>
      <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-bar" />
      {error && <p className="error-message">{error}</p>}
      <div>
        <h2>Events</h2>
        {filteredEvents.length ? filteredEvents.map((event, index) => (
          <div key={index} className="event">
            <h3>{event.attributes.name}</h3>
            <p>{event.attributes.description}</p>
            {event.attributes.entries.data.map(entry => (
              <div key={entry.id}>
                <span>Score: {entry.attributes.result}</span><br />
                <span>Emotion: {entry.attributes.rating}</span><br />
                <span>Comment: {entry.attributes.emotion}</span><br />
              </div>
            ))}
            <p>Created at: {new Date(event.attributes.dateTime).toLocaleString()}</p>
            <button onClick={() => handleSubmit(event.id)}>{submittedEvents[event.id] ? '✅' : 'Submit'}</button>
          </div>
        )) : <p>No events to display.</p>}
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default StudentPage;
