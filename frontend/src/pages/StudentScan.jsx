import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = "https://attendance-backend-5m4m.onrender.com";

const StudentScan = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert("Invalid QR");
      return;
    }

    const markAttendance = async () => {
      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            const userToken = localStorage.getItem("token");

            if (!userToken) {
              alert("Please login first");
              navigate("/login");
              return;
            }

            await axios.post(
              `${BACKEND_URL}/api/attendance/mark`,
              {
                qrToken: token,
                latitude,
                longitude,
              },
              {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                },
              }
            );

            alert("✅ Attendance marked successfully");
            navigate("/student");
          },
          () => {
            alert("Location permission denied");
          }
        );
      } catch (err) {
        alert(err.response?.data?.message || "Attendance failed");
      }
    };

    markAttendance();
  }, [token, navigate]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Scanning QR...</h2>
      <p>Please allow location access</p>
    </div>
  );
};

export default StudentScan;
