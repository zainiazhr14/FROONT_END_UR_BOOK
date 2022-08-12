import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { message } from "antd"
import request from "../core/request"
import storage from "../core/storage"


const storage_token_name = process.env.REACT_APP_STORAGE_TOKEN
const storage_user_name = 'user'

const userInitial = {
  full_name: '',
  profile: ''
}

const initialState = {
  user: storage.get(storage_user_name) || userInitial,
  token: storage.get(storage_token_name)
}

export const handleLogin = createAsyncThunk(
  'users/handleLogin',
  async (data) => {
    const response = await request.post('/auth/sign-in', data)
    return response.data
  }
)

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state, action) => {
      state.user = userInitial
      state.token = null

      storage.remove(storage_user_name)
      storage.remove(storage_token_name)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(handleLogin.fulfilled, (state, action) => {
      // Add user to the state array
      state.user = action.payload.user
      state.token = action.payload.token

      storage.set(storage_user_name, action.payload.user)
      storage.set(storage_token_name, action.payload.token)

      message.success('Log in Success')
    })
  }
})


export const { logout } = userSlice.actions

export default userSlice.reducer