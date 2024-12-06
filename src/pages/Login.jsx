import React from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { Link, useNavigate} from 'react-router-dom';
const { Option } = Select;
import logo from '../assets/cmti_logo.jpg';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Changed to named import


export default function Login() {

  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.role === 'operator') {
        navigate(`/${decoded.sub}/operator`);
      } else if (decoded.role === 'supervisor') {
        navigate('/supervisor');
      }
    }
  }, [navigate]);
    
  const onFinish = async (values) => {
    try {
      const response = await axios.post("http://localhost:8000/login", {
        username: values.username,
        password: values.password,
        role: values.role,
      });
  
      if (response.data.message === "login successfull") {
        message.success('Login Successful');

        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('username', values.username);

        if (values.role === 'operator') {
          navigate(`/${values.username}/operator`);
        } else if (values.role === "supervisor") {
          navigate('/supervisor');
        }
      }
      else if(response.data.message === "login failed"){
        message.error('Invalid username, password, or role');
      }
    }  catch (error) {
        message.error('Invalid username, password, or role');
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
    <div style={{width:'100px' , height:'80px' , marginLeft:'30px'}}>
      <img src={logo} alt='logo'/>
    </div>
    <div style={{ maxWidth: 400, margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' , fontSize:'25px' }}>Sign in</h2>
      <Form
        name="loginForm"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        layout="vertical"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input placeholder="Enter your username" />
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
            <Option value="supervisor">Supervisor</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <span>Don't have an account? </span>
          <Link to="/signup">Create Account</Link>
        </div>
      </Form>
    </div>
    </>
  );
}
