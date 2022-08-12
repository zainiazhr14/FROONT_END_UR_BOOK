import { Row, Col, Input, message, Button, Popconfirm, Empty } from "antd";
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import request from "../../core/request";
import { useEffect, useState } from "react";
import { handleFavorite } from "../../features/favoriteSlice";
import useDebounce from "../../core/debounce";

const Favorite = () => {
  const dispatch = useDispatch();

  const BASE_FILE = process.env.REACT_APP_BASE_FILE

  const { id } = useSelector(state => state.user.user)
  const { books } = useSelector(state => state.favorite)

  const [keyword, setKeyword] = useState('')
  const debouncedSearch = useDebounce(keyword, 500);

  useEffect(() => {
    dispatch(handleFavorite({ id, keyword: null }))
  }, [])

  useEffect(() => {
    debouncedSearch ? dispatch(handleFavorite({ id, keyword })) : dispatch(handleFavorite({ id, keyword: null }))
  }, [debouncedSearch]);

  const handleDelete = async (bookId) => {
    await request.delete(`/favorite/${bookId}`).then(res => {
      message.success('Book Removed')
      dispatch(handleFavorite({ id, keyword: null }))
    })
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

        <Row>
          <Col span={12}>
            <h3 className='home-sub-title-explore'>List Favorite</h3>
          </Col>
        </Row>
        <br />
        <Row gutter={[20, 20]} justify='left' align='middle'>
          {
            books.length ?
            books.map((item, idx) => {
              return(
                <Col md={6} key={idx} align='center' style={{ height: 350 }}>
                  <Popconfirm
                    title="Are you sure to remove this book from favorite?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Yes, Remove"
                    cancelText="No"
                  >
                    <Button danger icon={<DeleteOutlined />} style={{ position: 'absolute', top: 0, right: 0 }} />
                  </Popconfirm>
                  <div className="pointer">
                    <div style={{ marginBottom: 10 }}>
                      <img src={`${BASE_FILE}${item.Book.cover}`} alt="Cover" style={{ width: 200, height: 300, objectFit: 'cover' }} />
                    </div>
                    <p className='text-elipsis disabled-text-color'>{item.Book.title}</p>
                  </div>
                </Col>
              ) 
            }) :
            <Empty style={{ margin: '20px auto' }}/>
          }
        </Row>
      </div>
    </>
  );
}

export default Favorite