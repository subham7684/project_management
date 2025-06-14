// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { combineReducers } from '@reduxjs/toolkit';
import { createWebStorage } from '../lib/hooks/browser-storage';

import authReducer from './slices/authSlice';
import ticketReducer from './slices/ticketSlice';
import projectReducer from './slices/projectSlice';
import sprintReducer from './slices/sprintSlice';
import epicReducer from './slices/epicSlice';
import commentReducer from './slices/commentSlice';
import reportReducer from './slices/reportSlice';
import visualizationReducer from "./slices/visualisationSlice";
import publicUserReducer from './slices/publicUserSlice';
import projectDetailsReducer from './slices/projectDetailsSlice';
import ticketDetailsReducer from "./slices/ticket/ticketDetails";

const storage = createWebStorage('local');

const rootReducer = combineReducers({
  auth: authReducer,
  public_user: publicUserReducer,
  tickets: ticketReducer,
  projects: projectReducer,
  sprints: sprintReducer,
  epics: epicReducer,
  comments: commentReducer,
  report: reportReducer,
  api_visual: visualizationReducer,
  projectDetails: projectDetailsReducer,
  ticketDetails: ticketDetailsReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;