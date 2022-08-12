import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import request from "../core/request"

const initialState = {
  books_id: [],
  books: []
}

export const handleFavorite = createAsyncThunk(
  'book/handleFavorite',
  async ({ id, keyword }) => {
    const params = {
      params: {
        q: `user_id=${id}`,
        populate: 'book',
      }
    }
    if (keyword) params.params.search = `title=${keyword}`

    const response = await request.get('/favorite', params)
    return response.data
  }
)

export const favoriteReducer = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(handleFavorite.fulfilled, (state, action) => {
      state.books = action.payload.favorite
      state.books_id = action.payload.favorite.map(item => item.book_id)
    })
  }
})


export default favoriteReducer.reducer