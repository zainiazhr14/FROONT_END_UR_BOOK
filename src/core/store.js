import { configureStore } from "@reduxjs/toolkit";
import favoriteReducer from "../features/favoriteSlice";
import useReducer from '../features/userSlice';


export default configureStore({
  reducer: {
    user: useReducer,
    favorite: favoriteReducer
  }
})