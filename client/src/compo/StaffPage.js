import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/StaffPage.css';
import * as XLSX from 'xlsx';

const StaffPage = () => {
  const [events, setEvents] = useState([]);//Create Event
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [eventName, setEventName] = useState('');//Event Name
  const [eventDescription, setEventDescription] = useState('');//Event Description
  const apiUrl = 'http://localhost:1337/api/events';
  const [editEventId, setEditEventId] = useState(null);//Edit Event
  const [newEventName, setNewEventName] = useState('');//Update Event Name
  const [user, setUser] = useState('');//User Display

  const [showModal, setShowModal] = useState(false);
  const [entryData, setEntryData] = useState([]);

  // Retrieve JWT, user, and role from session storage
  const jwt = sessionStorage.getItem('jwt');

  axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;




  // Show Entries Modal
  const handleShowEntries = async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:1337/api/entries?populate=*`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      setEntryData(response.data.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching event entries:', error);
      setError('Failed to fetch event entries.');
    }
  };





  // User Account  : Name
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
    fetchEvents();
  }, []);

  const handleLogout = () => {
    window.location.href = '/';
  };

  //fetch events
  const fetchEvents = () => {
    axios.get(`${apiUrl}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
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
        headers: { Authorization: `Bearer ${jwt}` },
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
      await axios.put(`${apiUrl}/${editEventId}`, { data: { name: newEventName, } }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      fetchEvents();
      setEditEventId(null); 
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
          headers: { Authorization: `Bearer ${jwt}` }
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
              headers: { Authorization: `Bearer ${jwt}` }
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
      <h1>Welcome {user.toUpperCase()} to the Staff Page</h1>
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
                <Button variant="info" onClick={() => handleShowEntries(event.id)}>Show</Button>
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

      {/* Show entry modal table */}
      {showModal && (
        <div className="modal show" style={{ display: "block" }} role="dialog">
          <div className="modal-dialog modal-lg"> {/* Use modal-lg for a larger modal */}
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Event Entries</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setShowModal(false)}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {/* Use table-responsive to make the table scroll horizontally on small devices */}
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Score</th>
                        <th>Rating</th>
                        <th>Emotion</th>
                        <th>Seen Date</th>
                        <th>Submit Date</th>
                        <th>Seen?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entryData.map((entry, index) => (
                        <tr key={index}>
                          <td>{entry.attributes.owner.data.attributes.username}</td>
                          <td>{entry.attributes.result}</td>
                          <td>{entry.attributes.rating}</td>
                          <td>{entry.attributes.emotion}</td>
                          <td>{entry.attributes.seen_DateTime}</td>
                          <td>{entry.attributes.act_DateTime}</td>
                          <td>{entry.attributes.seen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};


export default StaffPage;
