
import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

const TeacherPanel = () => {
  // ✅ Get auth data from localStorage (Option 1)
  const teacherId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [allowedRadius, setAllowedRadius] = useState("");

  const [qrToken, setQrToken] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [activeClassId, setActiveClassId] = useState(null);

  // =============================
  // AUTH GUARD (VERY IMPORTANT)
  // =============================
  useEffect(() => {
    if (!teacherId || role !== "teacher" || !token) {
      alert("Teacher not logged in");
    }
  }, [teacherId, role, token]);

  // =============================
  // FETCH TEACHER CLASSES
  // =============================
  useEffect(() => {
    if (!teacherId || role !== "teacher") return;

    const fetchClasses = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/class/teacher/${teacherId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClasses(res.data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };

    fetchClasses();
  }, [teacherId, role, token]);

  // =============================
  // CREATE CLASS
  // =============================
  const handleCreateClass = async (e) => {
    e.preventDefault();

    if (!teacherId || role !== "teacher") {
      alert("Teacher not logged in");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/class/create",
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

      // Clear form
      setName("");
      setLatitude("");
      setLongitude("");
      setAllowedRadius("");

      // Refresh class list
      const res = await axios.get(
        `http://localhost:5000/api/classroom/teacher/${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClasses(res.data);

    } catch (err) {
      console.error("Error creating class:", err);
      alert("Failed to create class");
    }
  };

  // =============================
  // GENERATE QR CODE
  // =============================
  const generateQR = async (classId) => {
    if (!teacherId || role !== "teacher") {
      alert("Teacher not logged in");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/attendance/generate",
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
      console.error("Error generating QR:", err);
      alert("Failed to generate QR");
    }
  };

  // =============================
  // UI
  // =============================
  return (
    <div style={{ padding: "20px" }}>
      <h1>Teacher Panel</h1>

      {/* Create Class */}
      <form onSubmit={handleCreateClass}>
        <input
          type="text"
          placeholder="Class Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
        />

        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Allowed Radius (meters)"
          value={allowedRadius}
          onChange={(e) => setAllowedRadius(e.target.value)}
          required
        />

        <br />
        <button type="submit">Create Class</button>
      </form>

      {/* Classes List */}
      <h2>Your Classes</h2>
      <ul>
        {classes.map((cls) => (
          <li key={cls._id} style={{ marginBottom: "20px" }}>
            <strong>{cls.name}</strong>
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
                  {expiresAt
                    ? new Date(expiresAt).toLocaleTimeString()
                    : ""}
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
