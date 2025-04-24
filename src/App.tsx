import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import UserRoutes from './routes/UserRoutes'
import TutorRoutes from "./routes/TutorRoutes";
import AdminRoutes from "./routes/AdminRoutes";

const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<UserRoutes/>}></Route>
          <Route path="/tutor/*" element={<TutorRoutes/>}></Route>
          <Route path="/admin/*" element={<AdminRoutes/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
