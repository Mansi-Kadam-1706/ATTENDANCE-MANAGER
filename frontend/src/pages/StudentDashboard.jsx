import { useEffect, useState } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";

const StudentDashboard = ({ studentId }) => {
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");
  const [scannerStarted, setScannerStarted] = useState(false);

  // Get GPS location
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setScannerStarted(true);
      },
      () => {
        alert("Please allow location access");
      }
    );
  };

  useEffect(() => {
    if (!scannerStarted || !location) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      async (decodedText) => {
        scanner.clear(); // stop scanning after success

        try {
          const res = await axios.post(
            "http://localhost:5000/api/qr/marks", // ✅ correct route
            {
              token: decodedText,
              studentId,
              latitude: location.latitude,
              longitude: location.longitude,
            }
          );

          setMessage(res.data.msg);
        } catch (err) {
          setMessage(err.response?.data?.msg || "Attendance failed");
        }
      },
      (error) => {
        // ignore scan errors
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scannerStarted, location, studentId]);

  return (
    <div>
      <h1>Student Panel</h1>

      <button onClick={getLocation}>Get My Location</button>

      {scannerStarted && <div id="reader" style={{ width: "300px" }}></div>}

      <p>{message}</p>
    </div>
  );
};

export default StudentDashboard;
