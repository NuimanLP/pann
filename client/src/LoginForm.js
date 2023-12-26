import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import axiosConfig from './axios-interceptor';
import { useNavigate } from 'react-router-dom';

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

        try {
            const response = await axios.post('http://localhost:1337/api/auth/local', {
                identifier: username,
                password: password
            });
            
            // Store the JWT token
            const token = response.data.jwt;
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const userResponse = await axios.get('http://localhost:1337/api/users/me?populate=role');
            if (userResponse.data.role.name === 'Student') {
                navigate('/student');
            }else if (userResponse.data.role.name === 'Staff') { 
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
        <Form onSubmit={handleSubmit}>
            {errMsg && (
                <Form.Group>
                    <Alert variant="danger">{errMsg}</Alert>
                </Form.Group>
            )}
            <Form.Group controlId="formBasicUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter username"
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

            <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Submit'}
            </Button>
        </Form>
    );
};

export default LoginForm;
