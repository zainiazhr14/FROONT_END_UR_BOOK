import { Row, Col, Input, Drawer, Button, Tag, message, Empty, Skeleton } from "antd";
import { SearchOutlined, StarOutlined, BookOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import request from "../../core/request";
import { useEffect, useState } from "react";
import { handleFavorite } from "../../features/favoriteSlice";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../core/debounce";
import bgSecondary from '../../assets/images/bg-secondary.svg'

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { books_id } = useSelector(state => state.favorite)

  const BASE_FILE = process.env.REACT_APP_BASE_FILE
  const initialBook = {
    Writer: {
      full_name: '',
      bio: '',
      profile: ''
    },
    cover: '',
    created_at: '',
    description: '',
    genre: [],
    rate: 0,
    title: '',
    total_page: 0,
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

  const colorData = [
    'magenta',
    'blue',
    'geekblue',
    'purple',
    'volcano'
  ]

  const [books, setBook] = useState([])
  const [book, setBookData] = useState(initialBook)
  const [bookSearch, setBookSearch] = useState([])
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const { id } = useSelector(state => state.user.user)
  const [keyword, setKeyword] = useState('')
  const debouncedSearch = useDebounce(keyword, 500);

  useEffect(() => {
    getBook()
    dispatch(handleFavorite({id, keyword: null}))
  }, [])

  useEffect(() => {
    setLoading(true)
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
      setBookSearch(data)
      setLoading(false)
    }
    
    if (debouncedSearch) {
      fetchData()
    } else {
      getBook()
    }
  }, [debouncedSearch]);

  const getBook = async () => {
    request.get('/book', {
      params: {
        populate: 'writer'
      }
    }).then(res => {
      setBook(res.data.book)
      setBookSearch([])
    })
  }

  const handleClickBook = (data) => {
    setBookData(data)
    setVisible(true)
  }

  const handleCloseDrawer = () => {
    setVisible(false)
  }

  const handleSaveFavorite = async () => {
    await request.post('/favorite', {
      user_id: id,
      book_id: book.id
    }).then(res => {
      message.success('Add tou your favorite successfully')
      handleToFavorite()
    })
  }

  const handleToFavorite = () => {
    return navigate('/favorite')
  }

  return(
    <>
      <div className='page-container'>
        <Row align='middle' justify='space-between'>
          <Col md={10}>
            <h1 className="home-title-explore">Explore</h1>
          </Col>
          <Col md={14} align='right'>
            <Input 
              size='large' 
              placeholder="Find The Book" 
              prefix={<SearchOutlined />} 
              className='input-rounded input-search' 
              onChange={val => setKeyword(val.target.value)}
            />
          </Col>
        </Row>
        <br />
        <br />
        <br />

        {
          !keyword ?
          <>
            <Row>
              <Col span={12}>
                <h3 className='home-sub-title-explore'>Popular Now</h3>
              </Col>
            </Row>
            <br />
            <div className='popular-now'>
              {
                books.length ?
                books.map((item, idx) => {
                  return(
                    <div key={idx} style={{ marginLeft: 30 }} onClick={() => handleClickBook(item)}>
                      <div className="card-popular-parent pointer">
                        <div className="input-rounded card-popular">
                          <img src={`${BASE_FILE}${item.cover}`} alt="Cover" className='cover-popular' />
                          <div className="card-popular-rate white-color rounded">
                            <StarOutlined /> {item.rate}
                          </div>
                        </div>
                        <p className='card-popular-title disabled-text-color'>{item.title}</p>
                      </div>
                    </div> 
                  ) 
                }) :
                <Empty
                  image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  imageStyle={{
                    height: 60,
                  }}
                  style={{
                    margin: '0 auto'
                  }}
                  description={
                    <span>
                      No Data <a href="#API">Popular</a>
                    </span>
                  }
                />
              }
            </div>
          </> :
          loading ? <Skeleton /> : 
          bookSearch.length ? 
            <>
              <Row>
                <Col span={12}>
                  <h3 className='home-sub-title-explore'>Result: {keyword}</h3>
                </Col>
              </Row>
              <br />
              <Row gutter={[20, 20]} justify='left' align='middle'>
                {
                  bookSearch.map((item, idx) => {
                    return(
                      <Col md={6} key={idx} align='center' style={{ height: 350 }}>
                        <div className="pointer">
                          <div style={{ marginBottom: 10 }}>
                            <img src={`${BASE_FILE}${item.cover}`} alt="Cover" style={{ width: 200, height: 300, objectFit: 'cover' }} />
                          </div>
                          <p className='text-elipsis disabled-text-color'>{item.title}</p>
                        </div>
                      </Col>
                    ) 
                  })
                }
              </Row>
            </> : <Empty />
        }

            <br />
            <Row>
              <Col span={12}>
                <h3 className='home-sub-title-explore'>Genre</h3>
              </Col>
            </Row>
            <br />
            <Row gutter={[20, 20]} justify='center' align='middle'>
                {
                  genreData.map((item, idx) => {
                    return(
                      <Col md={6} key={idx} align='middle' style={{ height: 250 }}>
                        <div className="pointer rounded card-genre">
                          <p className='text-elipsis disabled-text-color'>{item.label}</p>
                          <img src={bgSecondary} alt='bg-s' style={{ width: 100, position: 'absolute', top: 0, left: 0 }}/>
                          <img src={bgSecondary} alt='bg-s' style={{ transform: 'rotate(180deg)', width: 100, position: 'absolute', bottom: 0, right: 0 }}/>
                        </div>
                      </Col>
                    ) 
                  })
                }
              </Row>
      </div>
      <Drawer 
        title="Detail Book" 
        closable={false} 
        placement="right"  
        onClose={handleCloseDrawer} 
        visible={visible}
      >
        <div align='center'>
          <img 
            src={`${BASE_FILE}${book.cover}`} 
            alt='Cover' 
            style={{ width: 150, marginBottom: 10 }} 
          />
          <h3>{book.title}</h3>

          <Row justify='center' align='middle' style={{ margin: '15px 0' }}>
            <img 
              src={`${BASE_FILE}${book.Writer.profile}`} 
              alt='Cover' 
              className='avatar-image'
            />
            &nbsp;
            &nbsp;
            <h4>{book.Writer.full_name}</h4>
          </Row>

          <Row gutter={[24, 0]} justify='center' align='middle'>
            <Col span={12} align='right'>
              <span>
                <StarOutlined />
                &nbsp;
                {book.rate} Rate
              </span>
            </Col>
            <Col span={12} align='left'>
              <span>
                <BookOutlined />
                &nbsp;
                {book.total_page} Page
              </span>
            </Col>
          </Row>
          {
            books_id.includes(book.id) ?
            <Button 
              type="primary" 
              shape="round" 
              className="secondary-color" 
              style={{ marginTop: 10 }}
              onClick={handleToFavorite}
              ghost
            >
              Go to your favorite
            </Button> : 
            <Button 
              type="primary" 
              shape="round" 
              className="secondary-color" 
              style={{ marginTop: 10, border: 'none' }}
              onClick={handleSaveFavorite}
            >
              Add to your favorite
            </Button>
          }
          <br/>
          <br />
          <br />

          <div align='left'>
            <h3>
              Description
            </h3>
            <p className='disabled-text-color'>
              {book.description}
            </p>
          </div>
          
          <br />
          <br />
          <Row>
            {
              book.genre.map((item, idx) => {
                let color = Math.round(Math.random() * colorData.length)
                return <Tag key={idx} color={colorData[color]}>{item}</Tag>
              })
            }
          </Row>
        </div>
      </Drawer>
    </>
  );
}

export default Dashboard