import { 
  Row, 
  Col, 
  Input, 
  Space, 
  Table, 
  Button, 
  Modal ,
  Form,
  Upload,
  message,
  Popconfirm,
  Select,
  InputNumber
} from "antd";
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import request from "../../core/request";
import useDebounce from "../../core/debounce";

const { Option } = Select;

const Book = () => {
  const BASE_FILE = process.env.REACT_APP_BASE_FILE
  const initDetail = {
      id: null,
      title: '',
      writer_id: '',
      total_page: 1,
      rate: 0,
      genre: [],
      description: '',
      cover: null
  }

  const genreData = [
    {
      value: 'romance',
      label: 'Romance'
    },
    {
      value: 'horror',
      label: 'Horror'
    },
    {
      value: 'thriller',
      label: 'Thriller'
    },
    {
      value: 'comedy',
      label: 'Comedy'
    },
    {
      value: 'comic',
      label: 'Comic'
    },
    {
      value: 'action',
      label: 'Action'
    },
    {
      value: 'fiction',
      label: 'Fiction'
    },
    {
      value: 'science',
      label: 'Science'
    },
    {
      value: 'self-imrovement',
      label: 'Self Improvement'
    },
  ]

  const [visible, setVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [detail, setDetail] = useState(initDetail);
  const [book, setBook] = useState([]);
  const [writers, setWriter] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [form] = Form.useForm();
  const debouncedSearch = useDebounce(keyword, 500);

  useEffect(() => {
    getBooks()
    getWriter()
  }, [])

  useEffect(() => {
    form.setFieldsValue(detail);      
  }, [detail])

  useEffect(() => {
    async function fetchData() {
      let res = await request.get('/book',  {
        params: {
          search: `title=${debouncedSearch}`,
          populate: 'writer'
        }
      });
      let data = res.data.book.map((itm, idx) => {
        return {
          ...itm,
          key: idx + 1
        } 
      })
      setBook(data)
    }

    debouncedSearch ? fetchData() : getBooks();
  }, [debouncedSearch]);

  const getBooks = () => {
    request.get('/book', {
      params: {
        populate: 'writer'
      }
    }).then(res => {
      const data = res.data.book.map((itm, idx) => {
        return {
          ...itm,
          key: idx + 1
        } 
      })
      setBook(data)
    })
  }

  const getWriter = () => {
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
    form.resetFields()
    setDetail(initDetail)
    setVisible(false)
  }

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        await request.post('/book', {
            ...values,
            cover: file
        })
        message.success('Book Created');
        getBooks()
        setFile(null)
        form.resetFields()
        handleClose()
      })
      .catch(info => {
      });
  }

  const handleUpdate = () => {
    form
      .validateFields()
      .then(async (values) => {
        if (file) {
          values.cover = file
        } 

        await request.put(`/book/${detail.id}`, values)
        message.success('Book Updated');
        getBooks()
        handleClose()
      })
      .catch(info => {
      });
  }

  const handleDelete = async (id) => {
    await request.delete(`/book/${id}`).then(res => {
      message.success('Book deleted')
      getBooks()
    })
  }

  const handleDetail = async (id) => {
    await request.get(`/book/${id}`).then(async (res) => {
      const { 
        title,
        writer_id,
        total_page,
        rate,
        genre,
        description,
        id,
        cover
      } = res.data.book

      const data = {
        id,
        title,
        writer_id,
        total_page,
        rate,
        genre,
        description,
        cover
      }

      setDetail(data)
      showModal()
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
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200
    },
    {
      title: 'Writer',
      dataIndex: 'writer_id',
      key: 'writer_id',
      width: 120,
      render: (_, { Writer }) => (
        Writer.full_name
      ),
    },
    {
      title: 'Desciption',
      dataIndex: 'description',
      key: 'description',
      width: 500,
    },
    {
      title: 'Cover',
      key: 'profile',
      dataIndex: 'profile',
      render: (_, { cover }) => (
        <>
          { cover ?
            <img 
              src={`${BASE_FILE}${cover}`} 
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
      title: 'Total Page',
      dataIndex: 'total_page',
      key: 'total_page',
      width: 150,
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
            title="Are you sure to delete this book?"
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

  const genreOption = genreData.map(item => {
    return <Option key={item.value}>{item.label}</Option>
  })

  return(
    <>
      <div className='page-container'>
        <Row align='middle' justify='space-between'>
          <Col md={10}>
            <h1 className="home-title-explore">Book</h1>
          </Col>
          <Col md={14} align='right'>
            <Input 
              size='large' 
              placeholder="Find Book" 
              prefix={<SearchOutlined />} 
              className='input-rounded input-search'
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Col>
        </Row>
      </div>
      <br />
      <div className='page-container'>
        <Row align="middle">
          <Col span={12}>
            <h3>List Book</h3>
          </Col>
          <Col span={12} align='right'>
          <Button type="primary" className="rounded" icon={<PlusOutlined />} onClick={showModal}>
            Create Book
          </Button>
          </Col>
        </Row>
        <br />
        <Table columns={columns} dataSource={book} />
      </div>


      {/* Modal */}
      <Modal
        title={ detail.id ? 'Update Book' : 'Create Book' }
        visible={visible}
        onCancel={handleClose}
        onOk={detail.id ? handleUpdate : handleSubmit}
        okText='Save'
        maskClosable={false}
        style={{
          top: 30,
        }}
        forceRender
      >
        <Form
          form={form}
          name="basic"
          autoComplete="off"
          layout='vertical'
          initialValues={detail}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="writer_id" label="Writer" rules={[{ required: true, message: 'Please select writer' }]}>
            <Select
              placeholder="Select writer"
            >
              {
                writers.map((item, idx) => {
                  return <Option value={item.id} key={idx}>{ item.full_name }</Option>
                })
              }
            </Select>
          </Form.Item>

          <Row>
            <Col span={12}>
              <Form.Item
                name="total_page"
                label="Total Page"
                rules={[{ required: true, message: 'Please input total page' }]}
              >
                <InputNumber min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rate"
                label="Rate"
                rules={[{ required: true, message: 'Please input rate' }]}
              >
                <InputNumber min={0} max={5} stringMode/>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label='Genre'
            name='genre'
            rules={[{ required: true, message: 'Please select genre' }]}
          >
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Please select genre"
            >
              {genreOption}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input description' }]}
          >
            <Input.TextArea showCount maxLength={500} />
          </Form.Item>

          <Form.Item 
            label="Cover Book" 
            rules={[{ required: true, message: 'Please upload cover book' }]}
            valuePropName='cover'
          >
            {
              detail.cover && !file && 
              <img 
              src={`${BASE_FILE}${detail.cover}`} 
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

export default Book