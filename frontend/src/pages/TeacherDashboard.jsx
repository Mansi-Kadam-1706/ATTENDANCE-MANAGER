
import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

const TeacherPanel = () => {
  // Get logged-in teacher from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?._id;

  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [allowedRadius, setAllowedRadius] = useState("");

  const [qrToken, setQrToken] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [activeClassId, setActiveClassId] = useState(null);

  // Fetch all classes of teacher on load
  useEffect(() => {
    if (!teacherId) return;

    const fetchClasses = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/classroom/teacher/${teacherId}`
        );
        setClasses(res.data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };

    fetchClasses();
  }, [teacherId]);

  // Create a new class
  const handleCreateClass = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Teacher not logged in");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/classroom/create", {
        name,
        latitude: Number(latitude),
        longitude: Number(longitude),
        allowedRadius: Number(allowedRadius),
        teacherId: user._id,
      });

      alert("Class created successfully");

      // Clear inputs
      setName("");
      setLatitude("");
      setLongitude("");
      setAllowedRadius("");

      // Refresh class list
      const res = await axios.get(
        `http://localhost:5000/api/classroom/teacher/${teacherId}`
      );
      setClasses(res.data);
    } catch (err) {
      console.error("Error creating class:", err);
      alert("Failed to create class");
    }
  };

  // Generate QR for a class
  const generateQR = async (classId) => {
    if (!teacherId) {
      alert("Teacher not logged in");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/qr/generate", {
        teacherId,
        classId,
      });

      setQrToken(res.data.token);
      setExpiresAt(res.data.expiresAt);
      setActiveClassId(classId);
    } catch (err) {
      console.error("Error generating QR:", err);
      alert("Failed to generate QR");
    }
  };

  return (
    <div>
      <h1>Teacher Panel</h1>

      {/* Create Class Form */}
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

        <button type="submit">Create Class</button>
      </form>

      {/* List of Classes */}
      <h2>Your Classes</h2>
      <ul>
        {classes.map((cls) => (
          <li key={cls._id} style={{ marginBottom: "20px" }}>
            <strong>{cls.name}</strong> <br />
            Radius: {cls.allowedRadius} meters
            <br />
            <button onClick={() => generateQR(cls._id)}>Generate QR</button>

            {/* Show QR only for selected class */}
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
