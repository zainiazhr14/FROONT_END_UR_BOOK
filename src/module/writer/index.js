import { 
  Row, 
  Col, 
  Input, 
  Space, 
  Table, 
  Button, 
  Modal ,
  Form,
  Radio,
  Upload,
  message,
  Popconfirm
} from "antd";
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import request from "../../core/request";
import useDebounce from "../../core/debounce";

const Writer = () => {
  const BASE_FILE = process.env.REACT_APP_BASE_FILE
  const initDetail = {
    id: null,
    full_name: '',
    gender: 'male',
    bio: '',
    profile: null
  }

  const [visible, setVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [writers, setWriter] = useState([]);
  const [detail, setDetail] = useState(initDetail);
  const [keyword, setKeyword] = useState('');
  const [form] = Form.useForm();
  const debouncedSearch = useDebounce(keyword, 500);


  useEffect(() => {
    getWriters()
  }, [])

  useEffect(() => {
    form.setFieldsValue(detail);   
  }, [detail])

  useEffect(() => {
    async function fetchData() {
      let res = await request.get('/writer',  {
        params: {
          search: `full_name=${keyword}`
        }
      });
      let data = res.data.writer.map((itm, idx) => {
        return {
          ...itm,
          key: idx + 1
        } 
      })
      setWriter(data)
    }

    debouncedSearch ? fetchData() : getWriters();
  }, [debouncedSearch]);


  const getWriters = () => {
    request.get('/writer').then(res => {
      const data = res.data.writer.map((itm, idx) => {
        return {
          ...itm,
          key: idx + 1
        } 
      })
      setWriter(data)
    })
  }

  const showModal = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setDetail(initDetail);   
    form.resetFields();
    setVisible(false)
  }

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        await request.post('/writer', {
            ...values,
            profile: file
        })
        message.success('Writer Created');
        getWriters()
        handleClose()
      })
      .catch(info => {
      });
  }

  const handleDelete = async (id) => {
    await request.delete(`/writer/${id}`).then(res => {
      message.success('Writer deleted')
      getWriters()
    })
  }

  const handleDetail = async (id) => {
    await request.get(`/writer/${id}`).then(async (res) => {
      const {
        full_name,
        gender,
        bio,
        id,
        profile
      } = res.data.writer
      const data = {
        full_name,
        gender,
        bio,
        id,
        profile
      }
      setDetail(data)
      showModal()
    })
  }

  const handleUpdate = async () => {
    form
      .validateFields()
      .then(async (values) => {
        if (file) {
          values.profile = file
        }

        await request.put(`/writer/${detail.id}`, values)
        message.success('Writer Updated');
        getWriters()
        handleClose()
      })
      .catch(info => {
      });
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
      width: 200
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 50,
    },
    {
      title: 'Bio',
      dataIndex: 'bio',
      key: 'bio',
      width: 500,
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
            title="Are you sure to delete this writer?"
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
            <h1 className="home-title-explore">Writer</h1>
          </Col>
          <Col md={14} align='right'>
            <Input 
              size='large' 
              placeholder="Find Writer" 
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
            <h3>List Writers</h3>
          </Col>
          <Col span={12} align='right'>
          <Button type="primary" className="rounded" icon={<PlusOutlined />} onClick={showModal}>
            Create Writer
          </Button>
          </Col>
        </Row>
        <br />
        <Table columns={columns} dataSource={writers} />
      </div>


      {/* Modal */}
      <Modal
        style={{
          top: 30,
        }}
        title={detail.id ? 'Update Writer' : 'Create Writer'}
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
            label="Gender" 
            name="gender"
            rules={[{ required: true, message: 'Please input select gender' }]}
          >
            <Radio.Group>
              <Radio value="male"> Male </Radio>
              <Radio value="female"> Female </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="bio"
            label="Bio"
            rules={[{ required: true, message: 'Please input bio' }]}
          >
            <Input.TextArea showCount maxLength={500} />
          </Form.Item>

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

export default Writer