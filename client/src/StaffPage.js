import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import axiosConfig from './axios-interceptor';

const StaffPage = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const apiUrl = 'http://localhost:1337/api/events'; // Your Strapi API URL

  useEffect(() => {
    // Fetch all events when the component mounts
    fetchEvents();
  }, []);

  // Fetch all events
  const fetchEvents = () => {
    axios.get(`${apiUrl}`, {
      headers: {
        Authorization: `Bearer ${axiosConfig.jwt}`,
      },
    })
      .then(response => {
        setEvents(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
      });
  };

  // Create a new event
  const createEvent = async (eventData) => {
    try {
      const response = await axios.post('http://localhost:1337/api/events', eventData, {
        headers: {
          Authorization: `Bearer ${axiosConfig.jwt}`,
        },
      });
      console.log('Event created:', response.data);
    } catch (error) {
      console.error('Error creating event:', error.response || error.message);
    }
  };

  // Delete an event
  const deleteEvent = (eventId) => {
    axios.delete(`${apiUrl}/${eventId}`, {
      headers: {
        Authorization: `Bearer ${axiosConfig.jwt}`,
      },
    })
      .then(() => {
        fetchEvents(); 
      })
      .catch(error => {
        console.error('Error deleting event:', error);
        setError('Failed to delete event. Please try again.');
      });
  };

  // Update an event
  const updateEvent = async (eventId, updatedData) => {
    try {
      const response = await axios.put(`http://localhost:1337/api/events/${eventId}`, updatedData, {
        headers: {
          Authorization: `Bearer ${axiosConfig.jwt}`,
        },
      });
      console.log('Event updated:', response.data);
    } catch (error) {
      console.error('Error updating event:', error.response || error.message);
    }
  };

  return (
    <div className="staff-page">
      <h1>Welcome to the Staff Page</h1>
      <Button onClick={createEvent}>Create Event</Button>
      {error && <p className="error-message">{error}</p>}
      <div>
        <h2>Events</h2>
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} className="event">
              <h3>{event.attributes.name}</h3>
              <p>{event.attributes.description}</p>
              <Button onClick={() => updateEvent(event.id)}>Edit</Button>
              <Button onClick={() => deleteEvent(event.id)}>Delete</Button>
            </div>
          ))
        ) : (
          <p>No events to display.</p>
        )}
      </div>
    </div>
  );
};

export default StaffPage;
