
import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

const BACKEND_URL = "https://attendance-backend-5m4m.onrender.com";

const TeacherPanel = () => {
  // =============================
  // AUTH DATA (✅ FIXED)
  // =============================
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const teacherId = user?.id;
  const role = user?.role;

  // =============================
  // STATE
  // =============================
  const [classes, setClasses] = useState([]);

  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [allowedRadius, setAllowedRadius] = useState("");

  const [qrToken, setQrToken] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [activeClassId, setActiveClassId] = useState(null);

  // =============================
  // AUTH GUARD
  // =============================
  useEffect(() => {
    if (!token || role !== "teacher") {
      alert("Teacher not logged in");
    }
  }, [token, role]);

  // =============================
  // FETCH CLASSES
  // =============================
  useEffect(() => {
    if (!teacherId || role !== "teacher") return;

    const fetchClasses = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/class/teacher/${teacherId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClasses(res.data);
      } catch (err) {
        console.error("Fetch classes error:", err);
      }
    };

    fetchClasses();
  }, [teacherId, role, token]);

  // =============================
  // CREATE CLASS
  // =============================
  const handleCreateClass = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${BACKEND_URL}/api/class/create`,
        {
          name,
          latitude: Number(latitude),
          longitude: Number(longitude),
          allowedRadius: Number(allowedRadius),
          teacherId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Class created successfully");

      setName("");
      setLatitude("");
      setLongitude("");
      setAllowedRadius("");

      // refresh classes
      const res = await axios.get(
        `${BACKEND_URL}/api/class/teacher/${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClasses(res.data);
    } catch (err) {
      console.error("Create class error:", err);
      alert("Failed to create class");
    }
  };

  // =============================
  // GENERATE QR
  // =============================
  const generateQR = async (classId) => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/qrsession/generate`,
        {
          teacherId,
          classId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQrToken(res.data.token);
      setExpiresAt(res.data.expiresAt);
      setActiveClassId(classId);
    } catch (err) {
      console.error("QR error:", err);
      alert("Failed to generate QR");
    }
  };

  // =============================
  // UI
  // =============================
  return (
    <div style={{ padding: "20px" }}>
      <h1>Teacher Panel</h1>

      {/* CREATE CLASS */}
      <form onSubmit={handleCreateClass}>
        <input
          placeholder="Class Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
        />
        <input
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
        />
        <input
          placeholder="Allowed Radius (meters)"
          value={allowedRadius}
          onChange={(e) => setAllowedRadius(e.target.value)}
          required
        />
        <br />
        <button type="submit">Create Class</button>
      </form>

      {/* CLASS LIST */}
      <h2>Your Classes</h2>
      <ul>
        {classes.map((cls) => (
          <li key={cls._id} style={{ marginBottom: "20px" }}>
            <b>{cls.name}</b>
            <br />
            Radius: {cls.allowedRadius} meters
            <br />

            <button onClick={() => generateQR(cls._id)}>
              Generate QR
            </button>

            {activeClassId === cls._id && qrToken && (
              <div style={{ marginTop: "10px" }}>
                <QRCodeCanvas value={qrToken} size={200} />
                <p>
                  Expires at:{" "}
                  {new Date(expiresAt).toLocaleTimeString()}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherPanel;
