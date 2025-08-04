import React from 'react'
import logo from "../../assets/epulse.png";

function Dashboard() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full flex items-center justify-center bg-white">

      <div className="bg-black p-10 rounded-3xl shadow-xl w-full max-w-md text-center">
        <img src={logo} alt="Logo" className="w-40 h-auto mb-6 mx-auto" />
        <h1 className="text-3xl font-semibold text-white mb-4">
          Welcome !
        </h1>
        <p className="text-lg text-gray-200 mb-6">
          You are now logged as an Tutor to the dashboard. Feel free to explore.
        </p>

        
      </div>
    </div>
  )
}

export default Dashboard
