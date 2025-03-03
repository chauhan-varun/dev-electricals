import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './store/cartSlice'; // Adjust the path if necessary

const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

export default store; 