// store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import adminReducer from './slices/adminSlice';
import userReducer from './slices/userSlice';       
import tutorReducer from './slices/tutorSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['admin','user','tutor'], 
};

const rootReducer = combineReducers({
  admin: adminReducer,
  user: userReducer,     
  tutor: tutorReducer, 
  
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;