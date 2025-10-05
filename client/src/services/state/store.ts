import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './slice/auth';

export const store = configureStore({
  reducer: {
    login: loginReducer,
  },
});

// Infer types for useSelector and useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
