import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BrowserQRCodeReader } from "@zxing/browser";

const StudentDashboard = ({ studentId }) => {
  const videoRef = useRef(null);
  const qrReaderRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");
  const [scannerStarted, setScannerStarted] = useState(false);

  // 📍 Get GPS location
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setScannerStarted(true);
      },
      () => alert("Please allow location access"),
      { enableHighAccuracy: true }
    );
  };

  // 📷 Start ZXing Scanner
  useEffect(() => {
    if (!scannerStarted || !location) return;

    qrReaderRef.current = new BrowserQRCodeReader();

    qrReaderRef.current
      .decodeFromVideoDevice(
        null,
        videoRef.current,
        async (result, err) => {
          if (result) {
            const token = result.getText();

            qrReaderRef.current.reset(); // stop camera

            try {
              const res = await axios.post(
                "https://attendance-backend-5m4m.onrender.com/api/qrsession/mark",
                {
                  token,
                  studentId,
                  latitude: location.latitude,
                  longitude: location.longitude,
                }
              );

              setMessage(res.data.msg || "Attendance marked ✅");
            } catch (error) {
              setMessage(
                error.response?.data?.msg || "Attendance failed ❌"
              );
            }
          }
        }
      );

    return () => {
      qrReaderRef.current?.reset();
    };
  }, [scannerStarted, location, studentId]);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Student Panel</h1>

      {!scannerStarted && (
        <button onClick={getLocation}>
          Get My Location
        </button>
      )}

      {scannerStarted && (
        <video
          ref={videoRef}
          style={{ width: "300px", marginTop: "20px" }}
        />
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default StudentDashboard;
