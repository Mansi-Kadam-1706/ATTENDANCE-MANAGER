import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = "https://attendance-backend-5m4m.onrender.com";

const StudentScan = () => {
  const { token } = useParams(); // QR token from URL
  const navigate = useNavigate();
  const [message, setMessage] = useState("Scanning QR...");

  useEffect(() => {
    if (!token) {
      setMessage("❌ Invalid QR code");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const authToken = localStorage.getItem("token");

    if (!user || user.role !== "student") {
      setMessage("❌ Please login as student");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await axios.post(
            `${BACKEND_URL}/api/qrsession/mark`,
            {
              token,                    // ✅ correct key
              studentId: user.id,       // ✅ REQUIRED
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          setMessage("✅ Attendance marked successfully");
          setTimeout(() => navigate("/student"), 2000);

        } catch (err) {
          setMessage(
            err.response?.data?.message || "❌ Attendance failed"
          );
        }
      },
      () => {
        setMessage("❌ Location permission required");
      }
    );
  }, [token, navigate]);

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>Student Attendance</h2>
      <p>{message}</p>
    </div>
  );
};

export default StudentScan;
