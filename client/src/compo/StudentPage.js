import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CSS/StudentPage.css';

const StudentPage = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState('');


  const jwt = sessionStorage.getItem('jwt');

  axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;


  // Keep track of viewed and submitted events
  const [submittedEvents, setSubmittedEvents] = useState(JSON.parse(localStorage.getItem('submittedEvents')) || {});


  const myusername = async () => {
    const result = await axios.get('http://localhost:1337/api/users/me?populate=role');
    if (result.data.role) {
      setUser(result.data.username)
    }
  }
  useEffect(() => {
    myusername()
  }, [])

  useEffect(() => {
    axios.get('http://localhost:1337/api/events/studentRelated', {
      headers: {
        Authorization: `Bearer ${jwt}`,
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
    localStorage.setItem('submittedEvents', JSON.stringify(submittedEvents));
  }, [submittedEvents]);

  const handleLogout = () => {
    window.location.href = 'http://localhost:3000/';
  };

  const handleSubmit = async (id) => {
    try {
      console.log("Submitting event with id:", id);

      const response = await axios.post(`http://localhost:1337/api/entries/submit/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      console.log('Submission response:', response);
      setSubmittedEvents(prevState => ({ ...prevState, [id]: true }));
    } catch (error) {
      console.error('Error submitting event:', error);
      console.log('Error response:', error.response);
    }
  };

  // Filter events based on search term
  const filteredEvents = searchTerm
    ? events.filter(event =>
      event.attributes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.attributes.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : events;

  // Mark all relevant entries as seen
  const markAllEntriesAsSeen = async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/events/studentRelated', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      const events = response.data.data;

      for (let event of events) {
        if (event.attributes.entries && event.attributes.entries.data.length > 0) {
          // Loop through each entry in the event
          for (let entry of event.attributes.entries.data) {
            // Check if the entry has a result before marking as seen
            if (entry.attributes.result) {
              await axios.post(`http://localhost:1337/api/entries/${entry.id}/seen`, {}, {
                headers: {
                  Authorization: `Bearer ${jwt}`,
                },
              });
            }
          }
        }
      }
      console.log('All relevant entries marked as seen');
    } catch (error) {
      console.error('Error marking entries as seen:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      markAllEntriesAsSeen();
    }, 3000); // Delay marking entries as seen by 3 seconds
    return () => clearTimeout(timeoutId);
  }, []);



  return (
    <div className="student-page">
      <h1>Welcome {user.toUpperCase()} to the Student Page</h1>
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
                  <span>Score: {entry.attributes.result}</span><br />
                  <span>Emotion: {entry.attributes.rating}</span><br />
                  <span>Comment: {entry.attributes.emotion}</span><br />
                </div>

              ))}
              <p>Created at: {new Date(event.attributes.dateTime).toLocaleString()}</p>
              <button onClick={() => handleSubmit(event.id)}>
                {submittedEvents[event.id] ? '✅' : 'Submit'}
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
