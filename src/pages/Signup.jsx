import React from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/cmti_logo.jpg';
import axios from 'axios';

const { Option } = Select;

export default function Signup() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:8000/signup', {
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      if(response.data.message === "Data inserted successfully"){
        message.success('Signup successful');
        navigate('/');
      }
      else if (response.data.message === "Username already exists") {
        message.error("Username already exists. Please choose another.");
      }
      else if(response.data.message === "email alraedy exists"){
        message.error("Email already exists. Please use a different email.");
      }
       
    } catch (error) {
      message.error(errorMessage || 'Signup failed');
    }
  };
  

  return (
    <>
      <div style={{ width: '100px', height: '80px', marginLeft: '30px' }}>
        <img src={logo} alt="logo" />
      </div>
      <div style={{ maxWidth: 400, margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '25px' }}>Sign Up</h2>
        <Form name="signupForm" onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input placeholder="Enter your username" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select your role!' }]}
          >
            <Select placeholder="Select your role">
              <Option value="operator">Operator</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign Up
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <span>Already have an account? </span>
            <Link to="/">Login</Link>
          </div>
        </Form>
      </div>
    </>
  );
}
