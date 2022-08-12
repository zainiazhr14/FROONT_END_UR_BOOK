import { Row, Col, Button, Form, Input } from 'antd'
import { useDispatch } from 'react-redux'
import { handleLogin } from '../../features/userSlice'
import Book from '../../assets/images/Book1.svg'
import Logo from '../../assets/images/logo.svg'
import DotParticle from '../../assets/images/dot-particle.svg'


const Login = () => {
  const dispath = useDispatch();

  const onFinish = async (values) => {
    await dispath(handleLogin(values));
  };

  return (
    <Row className='login' align='middle'>
      <Col lg={10} sm={24} xs={24} className='form-login'>
        <img src={Logo} alt="Logo" />
        <h1 className='font-semi-bold'>Hello! Welcome back</h1>
        <Form
          className='form'
          layout='vertical'
          requiredMark={false}
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: 'Please input your username!',
              },
            ]}
          >
            <Input 
              placeholder="Input username" 
              bordered={false}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            className='form-input-password'
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
            ]}
          >
            <Input.Password 
              placeholder="Input password" 
              bordered={false}
            />
          </Form.Item>

          <Form.Item
          >
            <Button type="primary" htmlType="submit" className='form-login-submit'>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Col>
      <Col lg={14} sm={0} xs={0} className='banner-login show-md-up'>
        <div>
            <img src={Book} alt='book' className='banner-book' />
            <img src={DotParticle} alt="Particle" className='banner-dot' />
            <img src={DotParticle} alt="Particle" className='banner-dot-second' />
        </div>
      </Col>
    </Row>
    );
};  

export default Login;