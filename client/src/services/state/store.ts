import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/auth';
import contestsReducer from './slice/contests';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contests: contestsReducer,
  },
});

// Infer types for useSelector and useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
