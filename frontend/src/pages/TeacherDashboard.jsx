
import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

const BACKEND_URL = "https://attendance-backend-5m4m.onrender.com";
const FRONTEND_URL = "https://effervescent-peony-d1067a.netlify.app";
const TeacherPanel = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const teacherId = user?.id;
  const role = user?.role;

  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [allowedRadius, setAllowedRadius] = useState("");

  const [qrToken, setQrToken] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [activeClassId, setActiveClassId] = useState(null);

  useEffect(() => {
    if (!token || role !== "teacher") {
      alert("Teacher not logged in");
    }
  }, [token, role]);

  useEffect(() => {
    if (!teacherId) return;

    const fetchClasses = async () => {
      const res = await axios.get(
        `${BACKEND_URL}/api/class/teacher/${teacherId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses(res.data);
    };

    fetchClasses();
  }, [teacherId, token]);

  const handleCreateClass = async (e) => {
    e.preventDefault();

    await axios.post(
      `${BACKEND_URL}/api/class/create`,
      {
        name,
        latitude: Number(latitude),
        longitude: Number(longitude),
        allowedRadius: Number(allowedRadius),
        teacherId,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Class created");

    setName("");
    setLatitude("");
    setLongitude("");
    setAllowedRadius("");

    const res = await axios.get(
      `${BACKEND_URL}/api/class/teacher/${teacherId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setClasses(res.data);
  };

  const generateQR = async (classId) => {
    const res = await axios.post(
      `${BACKEND_URL}/api/qrsession/generate`,
      { teacherId, classId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setQrToken(res.data.token);
    setExpiresAt(res.data.expiresAt);
    setActiveClassId(classId);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Teacher Panel</h1>

      <form onSubmit={handleCreateClass}>
        <input placeholder="Class Name" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="Latitude" value={latitude} onChange={e => setLatitude(e.target.value)} required />
        <input placeholder="Longitude" value={longitude} onChange={e => setLongitude(e.target.value)} required />
        <input placeholder="Allowed Radius (meters)" value={allowedRadius} onChange={e => setAllowedRadius(e.target.value)} required />
        <br />
        <button type="submit">Create Class</button>
      </form>

      <h2>Your Classes</h2>
      <ul>
        {classes.map(cls => (
          <li key={cls._id} style={{ marginBottom: 20 }}>
            <b>{cls.name}</b>
            <br />
            Radius: {cls.allowedRadius} meters
            <br />
            <button onClick={() => generateQR(cls._id)}>Generate QR</button>

            {activeClassId === cls._id && qrToken && (
              <div style={{ marginTop: 10 }}>
                <QRCodeCanvas
                value={`https://effervescent-peony-d1067a.netlify.app/scan/${qrToken}`}
  size={220} />
                <p>Expires at: {new Date(expiresAt).toLocaleTimeString()}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherPanel;
