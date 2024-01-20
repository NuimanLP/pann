import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';
import axiosConfig from './axios-interceptor';
import './StaffPage.css';
import * as XLSX from 'xlsx';


const StaffPage = () => {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(null); //store the created event ID
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const apiUrl = 'http://localhost:1337/api/events'; // Strapi API URL


  useEffect(() => {
    // Fetch all events when the component mounts
    fetchEvents();
  }, []);

  // Create a new event
  const createEvent = async () => {
    const eventData = {
      data: {
        name: eventName,
        description: eventDescription,
      }
    };
  
    try {
      const response = await axios.post('http://localhost:1337/api/events', eventData, {
        headers: {
          Authorization: `Bearer ${axiosConfig.jwt}`,
        },
      });
      console.log("Full Response", response);
      setEventId(response.data.id); // Adjusted to match the response structure
      console.log('Event created:', response.data);

      // Check if the response has the expected structure and contains the event ID
      if (response.data && response.data.data && response.data.data.id) {
        setEventId(response.data.data.id); // Update the eventId state
        console.log('Event created:', response.data);
      } else {
        console.error("Event creation response does not contain an ID");
      }
    } catch (error) {
      console.error('Error creating event:', error.response || error.message);
    }
  };
  

  // File change
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  // Event handler for form submit
  const handleFileSubmit = async (e) => {
    e.preventDefault();
    console.log("Selected File:", selectedFile);
    console.log("Event ID:", eventId);
    if (selectedFile && eventId) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        console.log('Excel data:', json);

        const scoresWithEventId = json.map(entry => ({
          ...entry,
          eventId: eventId // Attach the event ID to each score entry
        }));

        try {
          const response = await axios.post('http://localhost:1337/api/entries/upload-scores', scoresWithEventId, {
            headers: {
              Authorization: `Bearer ${axiosConfig.jwt}`,
            },
          });
          console.log('Scores uploaded:', response.data);
          fetchEvents(); // Refresh events after uploading scores
        } catch (error) {
          console.error('Error uploading scores:', error.response || error.message);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      console.log("Either file is not selected or event ID is not set");
    }
  };


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

      {/* Event Creation Form */}
      <Form>
        <Form.Group controlId="formEventName">
          <Form.Label>Event Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter event name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formEventDescription">
          <Form.Label>Event Description</Form.Label>
          <Form.Control
            as="textarea"
            placeholder="Enter event description"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={createEvent}>Create Event</Button>
      </Form>

      {/* File Upload for Event Scores */}
      <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
      <Button onClick={handleFileSubmit}>Upload Event Scores</Button>
      {error && <p className="error-message">{error}</p>}

      {/* Display of Events */}
      <div>
        <h2>Events</h2>
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} className="event">
              <div className="event-details">
                <h3>{event.attributes.name}</h3>
                <p>{event.attributes.description}</p>
              </div>
              <div className="event-actions">
                <Button onClick={() => updateEvent(event.id)}>Edit</Button>
                <Button onClick={() => deleteEvent(event.id)}>Delete</Button>
              </div>
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