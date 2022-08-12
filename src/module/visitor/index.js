import { 
  Row, 
  Col, 
  Input, 
  Space, 
  Table, 
  Button, 
  Modal ,
  Form,
  Switch,
  Upload,
  message,
  Popconfirm
} from "antd";
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import request from "../../core/request";
import useDebounce from "../../core/debounce";

const Visitor = () => {
  const BASE_FILE = process.env.REACT_APP_BASE_FILE
  const initDetail = {
    id: null,
    full_name: '',
    username: '',
    is_active: true,
    profile: null
  }

  const ROLE = 'visitor'
  const [visible, setVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [visitors, setVisitor] = useState([]);
  const [detail, setDetail] = useState(initDetail);
  const [keyword, setKeyword] = useState('');
  const [form] = Form.useForm();
  const debouncedSearch = useDebounce(keyword, 500);

  useEffect(() => {
    getVisitor()
  }, [])

  useEffect(() => {
    form.setFieldsValue(detail);
    console.log(detail)
  }, [detail])

  useEffect(() => {
    async function fetchData() {
      let res = await request.get('/user',  {
        params: {
          q: `role=${ROLE}`,
          search: `full_name=${keyword}`
        }
      });
      let data = res.data.user.map((itm, idx) => {
        return {
          ...itm,
          key: idx + 1
        } 
      })
      setVisitor(data)
    }

    debouncedSearch ? fetchData() : getVisitor();
  }, [debouncedSearch]);


  const getVisitor = () => {
    request.get('/user', {
      params: {
        q: `role=${ROLE}`
      }
    }).then(res => {
      const data = res.data.user.map((itm, idx) => {
        return {
          ...itm,
          key: idx + 1
        } 
      })
      setVisitor(data)
    })
  }

  const showModal = () => {
    setVisible(true);
  };

  const handleClose = () => {
    form.resetFields();
    setDetail(initDetail)
    setVisible(false)
  }

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        delete values.confirm

        await request.post('/user', {
            ...values,
            role: ROLE
        })
        message.success('Visitor Created');
        getVisitor()
        form.resetFields()
        handleClose()
      })
      .catch(info => {
      });
  }

  const handleDelete = async (id) => {
    await request.delete(`/user/${id}`).then(res => {
      message.success('Visitor deleted')
      getVisitor()
    })
  }

  const handleDetail = async (id) => {
    await request.get(`/user/${id}`).then(async (res) => {
      const {
        id,
        full_name,
        username,
        is_active,
        profile,
      } = res.data.user
      const data = {
        id,
        full_name,
        username,
        is_active,
        profile
      }

      setDetail(data)
      showModal()
    })
  }

  const handleUpdate = () => {
    form
      .validateFields()
      .then(async (values) => {
        if (file) {
          values.profile = file
        }
        await request.put(`/user/${detail.id}`, values)
        message.success('Visitor Updated');
        getVisitor()
        handleClose()
      })
      .catch(info => {
      });
  }

  const handleChangeStatus = async (val, id) => {
    await request.post(`/user/status/${id}`, {
      status: val
    }).then(async (res) => {
      message.success('Visitor Status Updated')
    })
  }


  const propsUpload = {
    maxCount: 1,
    multiple: false,
    accept: '.jpeg, .png, .jpg',
    listType: 'picture-card',
    beforeUpload: (file) => {
      const lessThan2MB = file.size / 1024 / 1024 < 2;
      if (!lessThan2MB) {
        message.error('File must under 2MB');
        return Upload.LIST_IGNORE
      }
  
      return lessThan2MB;
    },
    customRequest: async (options) => {
      const { file, onSuccess, onError, onProgress } = options;

      const formData = new FormData();
      formData.append('file', file);
      try {
        await request.post(
          '/file/upload',
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: event => {
              onProgress({ percent: (event.loaded / event.total) * 100 });
            }
          }
        ).then(res => {
          setFile(res.data.file.path)
          onSuccess()
        })
      } catch(e) {
        onError()
        message.error('Something went wrong')
      }
    }
  };
  


  const columns = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      width: 300
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'usernmae',
      width: 300,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 300,
      render: (_, { id, is_active }) => (
        <>
          <Switch 
            checkedChildren="Active" 
            unCheckedChildren='Disable' 
            defaultChecked={is_active} 
            onChange={(val) => handleChangeStatus(val, id)}
          />
        </>
      ),
    },
    {
      title: 'Profile',
      key: 'profile',
      dataIndex: 'profile',
      render: (_, { profile }) => (
        <>
          { profile ?
            <img 
              src={`${BASE_FILE}${profile}`} 
              alt='profile'
              className="avatar-image"
            /> :
            <img 
              src='https://protkd.com/wp-content/uploads/2017/04/default-image-620x600.jpg' 
              alt='profile'
              className="avatar-image"
            />
          }
        </>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, { id }) => (
        <Space size="middle">
          <Button type="primary" className="rounded" onClick={() => handleDetail(id)} ghost>
            Detail
          </Button>
          <Popconfirm
            title="Are you sure to delete this visitor?"
            onConfirm={() => handleDelete(id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" className="rounded" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return(
    <>
      <div className='page-container'>
        <Row align='middle' justify='space-between'>
          <Col md={10}>
            <h1 className="home-title-explore">Visitor</h1>
          </Col>
          <Col md={14} align='right'>
            <Input 
              size='large' 
              placeholder="Find Visitor" 
              prefix={<SearchOutlined />} 
              className='input-rounded input-search' 
              onChange={val => setKeyword(val.target.value)}
            />
          </Col>
        </Row>
      </div>
      <br />
      <div className='page-container'>
        <Row align="middle">
          <Col span={12}>
            <h3>List Visitors</h3>
          </Col>
          <Col span={12} align='right'>
          <Button type="primary" className="rounded" icon={<PlusOutlined />} onClick={showModal}>
            Create Visitor
          </Button>
          </Col>
        </Row>
        <br />
        <Table columns={columns} dataSource={visitors} />
      </div>


      {/* Modal */}
      <Modal
        style={{
          top: 30,
        }}
        title={detail.id ? 'Update Visitor' : 'Create Visitor'}
        visible={visible}
        onCancel={handleClose}
        onOk={detail.id ? handleUpdate : handleSubmit}
        okText='Save'
        maskClosable={false}
        forceRender
      >
        <Form
          form={form}
          name="basic"
          autoComplete="off"
          layout='vertical'
        >
          <Form.Item
            label="Full Name"
            name="full_name"
            rules={[{ required: true, message: 'Please input full name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input username' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Status" valuePropName="checked" name='is_active' initialValue={true}>
            <Switch />
          </Form.Item>
          
          {
            !detail.id &&
            <>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: 'Please input your password!',
                  },
                  () => ({
                    validator(_, value) {
                      const regValidatePass = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,100}$/;
                      if (!value || value.match(regValidatePass)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('password must contain uppercase, lowercase, number, symbol'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name='confirm'
                label="Confirm Password"
                dependencies={['password']}
                rules={[
                  {
                    required: true,
                    message: 'Please confirm your password!',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }

                      return Promise.reject(new Error('The two passwords that you entered do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </>
          }

          <Form.Item 
            label="Profile" 
            rules={[{ required: true, message: 'Please upload profile' }]}
          >
            {
              detail.profile && !file && 
              <img 
                src={`${BASE_FILE}${detail.profile}`} 
                alt='img' 
                style={{
                  width: 120,
                  objectFit: 'cover',
                  margin: '10px 0'
                }}
              />
              }
            <Upload {...propsUpload}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

        </Form>
      </Modal>
    </>
  );  
}

export default Visitor