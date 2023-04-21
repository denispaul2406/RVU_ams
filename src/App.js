import React, { useState, useEffect } from "react";
import GoogleLogin from "react-google-login";
import axios from "axios";
import { gapi } from "gapi-script";

const API_KEY = "AIzaSyD9MME9e7i0tbXPhfTd-JClpJ5wvKGVasI";
const SPREADSHEET_ID = "15Wv64-3N5IBxVtgkBecLKAh0RMHQEDqFJl9OtIuaYj4";
const CLIENT_ID = "647195490210-5ktvkodptt8e1n67jnv20ng528gmu3ut.apps.googleusercontent.com";

function App() {
  const [attendancePercentages, setAttendancePercentages] = useState(null);

  const handleLogin = async (googleUser) => {
    const idToken = googleUser.getAuthResponse().id_token;
    const userEmail = googleUser.getBasicProfile().getEmail();
    console.log("Logged in as", userEmail);

    try {
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A1:F57`,
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

      const data = response.data.values;

      // Find the row containing the logged-in user's email address
      const userRow = data.find((row) => row[0] === userEmail);

      // If the user's email address is not found, set the attendance percentages to 0 for all subjects
      if (!userRow) {
        setAttendancePercentages({
          ADS: 0,
          DBMS: 0,
          ASW: 0,
          FS: 0,
          PWC: 0,
        });
        return;
      }

      const headerRow = data[0];

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
    } catch (error) {
      console.error(error);
    }
  };

  // const signInWithGoogle = () => {
  //   gapi.auth2.getAuthInstance().signIn({
  //     scope: "profile email",
  //   });
  // };
  const handleLogout = () => {
    gapi.auth2.getAuthInstance().signOut();
    setAttendancePercentages(null);
  };

  useEffect(() => {
    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          clientId: CLIENT_ID,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
          scope: "https://www.googleapis.com/auth/spreadsheets",
        })
        .then(() => {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
            if (isSignedIn) {
              handleLogin(gapi.auth2.getAuthInstance().currentUser.get());
            }
          });

          // Handle the initial sign-in state.
          if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            handleLogin(gapi.auth2.getAuthInstance().currentUser.get());
          }
        });
    });
  }, []);

  return (
    <div>
      {attendancePercentages ? (
        <div>
          <h2>Attendance Percentages:</h2>
          <ul>
            <li>ADS: {attendancePercentages.ADS}%</li>
            <li>DBMS: {attendancePercentages.DBMS}%</li>
            <li>ASW: {attendancePercentages.ASW}%</li>
            <li>FS: {attendancePercentages.FS}%</li>
            <li>PWC: {attendancePercentages.PWC}%</li>
        </ul>
        <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <h2>Please sign in to view attendance percentages.</h2>
          <GoogleLogin
            clientId={CLIENT_ID}
            buttonText="Sign in with Google"
            onSuccess={handleLogin}
            onFailure={(error) => console.error(error)}
            cookiePolicy={"single_host_origin"}
            responseType="id_token"
            scope="profile email"
          />
        </div>
      )}
</div>
);}
export default App;
