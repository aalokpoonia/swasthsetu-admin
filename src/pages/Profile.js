import React from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#111827] text-white p-6">
        <h1 className="text-3xl font-bold">SwasthSetu</h1>
        <p className="text-gray-400 text-sm mt-1">Healthcare Admin</p>

        <div className="mt-10 space-y-3">

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/patients")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800"
          >
            Patients
          </button>

          <button
            onClick={() => navigate("/doctors")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800"
          >
            Doctors
          </button>

          <button
            onClick={() => navigate("/appointments")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800"
          >
            Appointments
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800"
          >
            Reports
          </button>

          <button className="w-full text-left px-4 py-3 rounded-lg bg-emerald-600">
            My Profile
          </button>

        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
          
          <div className="flex items-center gap-6">
            
            <div className="w-24 h-24 rounded-full bg-[#111827] text-white flex items-center justify-center text-4xl font-bold">
              A
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Aalok Poonia
              </h1>

              <p className="text-gray-500 mt-1">
                admin@swasthsetu.com
              </p>

              <span className="inline-block mt-3 bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-medium">
                Administrator
              </span>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-gray-500 text-sm">Total Patients</h3>
              <p className="text-3xl font-bold mt-2 text-gray-800">1284</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-gray-500 text-sm">Doctors Managed</h3>
              <p className="text-3xl font-bold mt-2 text-gray-800">48</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-gray-500 text-sm">Last Login</h3>
              <p className="text-lg font-semibold mt-2 text-gray-800">
                Today, 8:45 PM
              </p>
            </div>

          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              About Admin
            </h2>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <p className="text-gray-600 leading-7">
                Responsible for managing patient records, appointments,
                doctors, reports and overall hospital administration
                activities within the SwasthSetu Healthcare System.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;