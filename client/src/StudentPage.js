import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, ListGroup, Form, Button, Alert } from 'react-bootstrap';

const StudentPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [resources, setResources] = useState([]);
    const [feedback, setFeedback] = useState('');
    const [feedbackStatus, setFeedbackStatus] = useState(null);

    useEffect(() => {
        // Fetch announcements (replace with your actual API endpoint)
        axios.get('/api/announcements')
            .then(response => setAnnouncements(response.data))
            .catch(error => console.error('Error fetching announcements:', error));

        // Fetch resources (replace with your actual API endpoint)
        axios.get('/api/resources')
            .then(response => setResources(response.data))
            .catch(error => console.error('Error fetching resources:', error));
    }, []);

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        // Post feedback (replace with your actual API endpoint)
        axios.post('/api/feedback', { content: feedback })
            .then(() => {
                setFeedbackStatus('Feedback submitted successfully!');
                setFeedback('');
            })
            .catch(error => {
                setFeedbackStatus('Failed to submit feedback.');
                console.error('Error submitting feedback:', error);
            });
    };

    return (
        <div className="student-page">
            <h1>Student Dashboard</h1>

            <section>
                <h2>Latest Announcements</h2>
                <ListGroup>
                    {announcements.map((announcement, index) => (
                        <ListGroup.Item key={index}>{announcement.title}</ListGroup.Item>
                    ))}
                </ListGroup>
            </section>

            <section>
                <h2>Resources & Materials</h2>
                <div className="resource-grid">
                    {resources.map((resource, index) => (
                        <Card key={index} style={{ width: '18rem' }}>
                            <Card.Body>
                                <Card.Title>{resource.title}</Card.Title>
                                <Card.Text>{resource.description}</Card.Text>
                                <Button variant="primary" href={resource.link} target="_blank">Learn More</Button>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                <h2>Submit Feedback</h2>
                <Form onSubmit={handleFeedbackSubmit}>
                    <Form.Group controlId="feedbackForm.ControlTextarea">
                        <Form.Label>Your Feedback</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            value={feedback} 
                            onChange={(e) => setFeedback(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Button variant="success" type="submit">Submit Feedback</Button>
                </Form>
                {feedbackStatus && <Alert variant={feedbackStatus.startsWith('Failed') ? 'danger' : 'success'}>{feedbackStatus}</Alert>}
            </section>

            {/* Additional sections like user profile, course schedules, etc., can be added here */}
        </div>
    );
};

export default StudentPage;
