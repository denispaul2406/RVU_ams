/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import GoogleLogin from "react-google-login";
import axios from "axios";
import { gapi } from "gapi-script";

const API_KEY = "AIzaSyD9MME9e7i0tbXPhfTd-JClpJ5wvKGVasI";
const ATTENDANCE_SPREADSHEET_ID = "15Wv64-3N5IBxVtgkBecLKAh0RMHQEDqFJl9OtIuaYj4";
const GRADES_SPREADSHEET_ID = "1rDl3MbZFhuuvAo6srNXIVYgZn0Py3-CwFjS3xkKfbl8";
const CLIENT_ID = "647195490210-5ktvkodptt8e1n67jnv20ng528gmu3ut.apps.googleusercontent.com";

function App() {
const [attendancePercentages, setAttendancePercentages] = useState(null);
const [gradePercentages, setGradePercentages] = useState(null);

const handleLogin = async (googleUser) => {
const idToken = googleUser.getAuthResponse().id_token;
const userEmail = googleUser.getBasicProfile().getEmail();
console.log("Logged in as", userEmail);
try {
  const attendanceResponse = await axios.get(
    `https://sheets.googleapis.com/v4/spreadsheets/${ATTENDANCE_SPREADSHEET_ID}/values/Sheet1!A1:F57`,
    {
      headers: {
        Authorization: `${idToken}`,
      },
      params: {
        key: API_KEY,
        majorDimension: "ROWS",
        valueRenderOption: "FORMULA",
      },
    }
  );

  const attendanceData = attendanceResponse.data.values;

  // Find the row containing the logged-in user's email address
  const userRow = attendanceData.find((row) => row[0] === userEmail);

  // If the user's email address is not found, set the attendance percentages to 0 for all subjects
  if (!userRow) {
    setAttendancePercentages({
      ADS: 0,
      DBMS: 0,
      ASW: 0,
      FS: 0,
    });
  } else {
    const headerRow = attendanceData[0];

    // Loop through all subjects and get attendance percentage for each subject
    const attendancePercentagesObj = {};
    headerRow.forEach((subject, index) => {
      if (index === 0) {
        return;
      }
      const attendancePercentage = userRow[index];
      attendancePercentagesObj[subject] = attendancePercentage || 0;
    });

    setAttendancePercentages(attendancePercentagesObj);
  }

  const gradesResponse = await axios.get(
    `https://sheets.googleapis.com/v4/spreadsheets/${GRADES_SPREADSHEET_ID}/values/Sheet1!A1:B56`,
    {
      headers: {
        Authorization: `${idToken}`,
      },
      params: {
        key: API_KEY,
        majorDimension: "ROWS",
        valueRenderOption: "FORMULA",
      },
    }
  );

  const gradesData = gradesResponse.data.values;
  // Find the row containing the logged-in user's email address
  const userGradesRow = gradesData.find((row) => row[0] === userEmail);

  // If the user's email address is not found, set the grade percentages to 0 for all subjects
  if (!userGradesRow) {
    setGradePercentages({
      ADS: 0,
      DBMS: 0,
      ASW: 0,
      FS: 0,
    });
  } else {
    const headerRow = gradesData[0];

    // Loop through all subjects and get grade percentage for each subject
    const gradePercentagesObj = {};
    headerRow.forEach((subject, index) => {
      if (index === 0) {
        return;
      }
      const gradePercentage = userGradesRow[index];
      gradePercentagesObj[subject] = gradePercentage || 0;
      });
      setGradePercentages(gradePercentagesObj);
    }
  } catch (error) {
  console.error(error);
  }
  };
  
  return (
  
  <div className="App">
    <h1>Attendance and Grades</h1>
    <GoogleLogin
      clientId={CLIENT_ID}
      buttonText="Login with Google"
      onSuccess={handleLogin}
      onFailure={console.error}
      cookiePolicy={"single_host_origin"}
      responseType="id_token"
      isSignedIn={true}
    />
    {attendancePercentages && gradePercentages ? (
      <div>
        <h2>Attendance:</h2>
        <ul>
          <li>ADS: {attendancePercentages.ADS}%</li>
          <li>DBMS: {attendancePercentages.DBMS}%</li>
          <li>ASW: {attendancePercentages.ASW}%</li>
          <li>FS: {attendancePercentages.FS}%</li>
        </ul>
        <h2>Grades:</h2>
        <ul>
          <li>ADS: {gradePercentages.ADS}%</li>
          <li>DBMS: {gradePercentages.DBMS}%</li>
          <li>ASW: {gradePercentages.ASW}%</li>
          <li>FS: {gradePercentages.FS}%</li>
        </ul>
      </div>
    ) : (
      <p>Please log in to view attendance and grades.</p>
    )}
  </div>
  );
  }
  export default App;
