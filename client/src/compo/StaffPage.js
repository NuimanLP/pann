import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';
import axiosConfig from '../axios-interceptor';
import '../CSS/StaffPage.css';
import * as XLSX from 'xlsx';

const StaffPage = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const apiUrl = 'http://localhost:1337/api/events';
  const [editEventId, setEditEventId] = useState(null);
  const [newEventName, setNewEventName] = useState('');


  useEffect(() => {
    fetchEvents();
  }, []);

  const handleLogout = () => {
    window.location.href = 'http://localhost:3000/';
  };

  //fetch events
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
  const deleteEvent = async (eventId) => {
    try {
      await axios.delete(`${apiUrl}/${eventId}`, {
        headers: { Authorization: `Bearer ${axiosConfig.jwt}` },
      });
      fetchEvents();
    } catch (error) {
      setError('Failed to delete event. Please try again.');
    }
  };

  const showEditForm = (event) => {
    setEditEventId(event.id);
    setNewEventName(event.attributes.name);
  };

  // Update an event
  const updateEvent = async () => {
    if (!newEventName.trim()) {
      setError('Event name cannot be empty.');
      return;
    }

    try {
      await axios.put(`${apiUrl}/${editEventId}`, { data: { name: newEventName, description: eventDescription } }, {
        headers: { Authorization: `Bearer ${axiosConfig.jwt}` },
      });
      fetchEvents();
      setEditEventId(null); // Reset edit state
    } catch (error) {
      setError('Error updating event. Please try again.');
    }
  };




  // Upload scores and create event
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleCreateAndUpload = async () => {

    if (selectedFile && eventName && eventDescription) {
      try {
        // Create a new event first
        const eventData = { data: { name: eventName, description: eventDescription, dateTime: new Date() } };
        const createResponse = await axios.post('http://localhost:1337/api/events', eventData, {
          headers: { Authorization: `Bearer ${axiosConfig.jwt}` }
        });
        console.log('Create response:', createResponse)
        const reader = new FileReader();


        ///**********////// */
        if (reader !== null) {
          // Process the Excel file
          reader.onload = async (e) => {
            console.log('FileReader onload triggered');
            const workbook = XLSX.read(e.target.result, { type: 'array' });
            const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
            // console.log('JSON:', json);
            // Transform data to match the required structure
            const transformedData = json.map(entry => ({
              data: {
                owner: entry.studentId,
                result: entry.score,
                event: eventName,
                // --> Errorr this make me create the event name 2 times
                rating: entry.rate,
                emo: entry.emo,
              }
            }));

            console.log('Transformed data:', transformedData);

            // Upload the transformed data
            const uploadResponse = await axios.post('http://localhost:1337/api/entries/upload-scores', transformedData, {
              headers: { Authorization: `Bearer ${axiosConfig.jwt}` }
            });

            console.log('Upload response:', uploadResponse);
            fetchEvents();
          };
          reader.readAsArrayBuffer(selectedFile);
        } else {
          setError('Error creating event. Please try again.');
        }
      } catch (error) {
        console.error('Error creating event:', error.response);
        setError('Error uploading scores. Please try again.');
      }
    } else {
      setError('Please select a file and fill in all event details.');
    }
  };


  return (
    <div className="staff-page">
      <h1>Welcome to the Staff Page</h1>
      {error && <div className="error-message">{error}</div>}

      {/* Event Creation Form */}
      <Form>
        <Form.Group>
          <Form.Label>Event Name</Form.Label>
          <Form.Control type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Event Description</Form.Label>
          <Form.Control as="textarea" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Upload Scores</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
        </Form.Group>
        <Button variant="primary" onClick={handleCreateAndUpload}>Create Event and Upload Scores</Button>
      </Form>


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
                <Button onClick={() => showEditForm(event)}>Edit</Button>
                <Button variant="danger" onClick={() => deleteEvent(event.id)}>Delete</Button>
              </div>
            </div>
          ))
        ) : (
          <p>No events to display.</p>
        )}
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      {/* Popup Edit Form */}
      {editEventId && (
        <div className="edit-popup">
          <input type="text" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} />
          <button onClick={updateEvent}>Save Changes</button>
          <button onClick={() => setEditEventId(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};


export default StaffPage;
