import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import tutorReducer from "./slices/tutorSlice"
import adminReducer from "./slices/adminSlice"

const store = configureStore({
    reducer:{
        user: userReducer,
        tutor:tutorReducer,
        admin:adminReducer
    }
})



export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store