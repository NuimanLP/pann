import React, { useState } from 'react';
import { Form, Button, Alert, Container, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../CSS/LoginForm.css';

const LoginForm = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errMsg, setErrMsg] = useState(null);

    const handleUsernameChange = (e) => setUsername(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrMsg(null);
        console.log('Form submitted:', { username, password });

        try {

            console.log('Sending login request...');
            const response = await axios.post('http://localhost:1337/api/auth/local', {
                identifier: username,
                password: password
            });

            console.log('Login response:', response);

            const token = response.data.jwt;
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log('Fetching user details...');
            const userResponse = await axios.get('http://localhost:1337/api/users/me?populate=role');
            console.log('User response:', userResponse);


            
            //Session Storage
            sessionStorage.setItem('jwt', token);
            sessionStorage.setItem('username', userResponse.data.username);
            sessionStorage.setItem('role', userResponse.data.role.name);


            if (userResponse.data.role.name === 'Student') {
                navigate('/student');
            } else if (userResponse.data.role.name === 'Staff') {
                navigate('/staff');
            }
        } catch (error) {
            console.error(error);
            setErrMsg('Wrong username or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="d-flex flex-column align-items-center justify-content-center login-container"> {/* link login conatainer form css */}
            <img src="/psu-passport.png" alt="PSU Passport" className="login-logo mb-4" /> {/*link from CSS*/}
            <Form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: '320px' }}>
                {errMsg && (
                    <Alert variant="danger">{errMsg}</Alert>
                )}
                <Form.Group controlId="formBasicUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username ex.66101***@email.psu.ac.th"
                        value={username}
                        onChange={handleUsernameChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                </Form.Group>
                <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Login'} {/* text display */}
                    {isLoading && (
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    )}
                </Button>

            </Form>
        </Container>
    );
};

export default LoginForm;
