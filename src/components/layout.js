import { 
  Layout,
  Menu, 
  Col, 
  Row, 
  Dropdown, 
  Space 
} from 'antd';
import { 
  DownOutlined, 
  UserOutlined, 
  QuestionOutlined, 
  LogoutOutlined,
  BookOutlined,
  HomeOutlined,
  StarOutlined,
  UsergroupAddOutlined,
  BulbOutlined
} from '@ant-design/icons';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { routesNoLayout } from '../core/router';
import { logout } from '../features/userSlice';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/images/logo.svg'



const { Sider, Header, Content } = Layout;

const NavLayout = ({ children }) => {
  const dispath = useDispatch();
  const navigator = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const currentPath = window.location.pathname
  const { full_name, profile, role } = useSelector(state => state.user.user)
  const BASE_FILE = process.env.REACT_APP_BASE_FILE

  let renderView;
  

  function getItem(label, key, icon, children, onClick) {
    return {
      key,
      icon,
      children,
      label,
      onClick
    };
  }
  
  const routesAdmin = [
    getItem('Home', '/', <HomeOutlined />, null, () => navigator('/')),
    getItem('Book', '/book', <BookOutlined />, null, () => navigator('/book')),
    getItem('Visitor', '/visitor', <UsergroupAddOutlined />, null, () => navigator('/visitor')),
    getItem('Writer', '/writer', <BulbOutlined />, null, () => navigator('/writer')),
    getItem('Favorite', '/favorite', <StarOutlined />, null, () => navigator('/favorite')),
  ];

  const routesVisitor = [
    getItem('Home', '/', <HomeOutlined />, null, () => navigator('/')),
    getItem('Favorite', '/favorite', <StarOutlined />, null, () => navigator('/favorite')),
  ];

  const menu = (
    <Menu
      items={[
        // {
        //   label: <a href="#b">Profile</a>,
        //   key: '0',
        //   icon: <UserOutlined />
        // },
        // {
        //   label: <a href="#a">Help</a>,
        //   key: '1',
        //   icon: <QuestionOutlined />
        // },
        // {
        //   type: 'divider',
        // },
        {
          label: 'Logout',
          key: '3',
          icon: <LogoutOutlined />,
          onClick: () => {
            dispath(logout())
          }
        },
      ]}
    />
  );

  if (!routesNoLayout.includes(currentPath)) {
    renderView = <Layout hasSider>
                    <Sider
                      className='white-color'
                      style={{
                        overflow: 'auto',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                      }}
                      collapsible collapsed={collapsed} 
                      onCollapse={(value) => setCollapsed(value)}
                    >
                      <Menu 
                        mode="inline" 
                        defaultSelectedKeys={[currentPath]} 
                        items={role === 'admin' ? routesAdmin : routesVisitor} 
                        style={{ paddingTop: 90 }} 
                      >
                      </Menu>
                    </Sider>
                    <Layout>
                      <Header 
                        className='white-color layout-header'
                        style={{ 
                          position: 'fixed', 
                          zIndex: 2, 
                          width: '100%', 
                          height: 80 
                        }} 
                      >
                        <Row align='middle' style={{ height: '100%' }} justify="space-between">
                          <Col span={6}>
                            <img src={Logo} alt='logo' className='layout-logo' />
                          </Col>
                          <Col span={6} align='right'>
                            <Dropdown overlay={menu} trigger={['click']} className='layout-profile'>
                                <Space>
                                  Hello, {full_name}
                                  {
                                    profile ?
                                    <img 
                                      src={`${BASE_FILE}${profile}`} 
                                      alt="profile"
                                      className='layout-image-profile'
                                    /> :
                                    <img 
                                      src="https://cdn1.vectorstock.com/i/1000x1000/23/70/man-avatar-icon-flat-vector-19152370.jpg" 
                                      alt="profile"
                                      className='layout-image-profile'
                                    />
                                  }
                                  <DownOutlined />
                                </Space>
                            </Dropdown>
                          </Col>
                        </Row>
                      </Header>
                      <Content
                        style={{ 
                          margin: collapsed ? '100px 50px 0 100px' : '100px 50px 0 230px', 
                          overflow: 'initial', 
                          minHeight: 'calc(100vh - 100px)', 
                          transition: '.3s' 
                        }}
                      >
                        <div>
                          { children }
                        </div>
                      </Content>
                    </Layout>
                  </Layout>
  } else {
    renderView = children
  }

  return (
    <>
      { renderView }
    </>
  )
};

export default NavLayout;