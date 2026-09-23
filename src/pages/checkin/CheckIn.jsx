import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CheckIn.css';

function CheckIn() {
  const { token } = useAuth();

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [equipmentId, setEquipmentId] = useState('');
  const [conditionOnReturn, setConditionOnReturn] = useState('Good');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  // Load only equipment that is currently "Checked Out"
  useEffect(() => {
    const fetchCheckedOutEquipment = async () => {
      try {
        // const response = await fetch('http://localhost:5000/api/equipment', {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/equipment`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load equipment');
        }

        // Keep only items that are checked out
        const checkedOut = data.equipment.filter((item) => item.status === 'Checked Out');
        setEquipmentList(checkedOut);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckedOutEquipment();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
     
      
      // const response = await fetch('http://localhost:5000/api/transactions/checkin', {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipmentId,
          conditionOnReturn,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Check-in failed');
      }

      setMessage('Equipment checked in successfully!');
      // Clear form
      setEquipmentId('');
      setConditionOnReturn('Good');
      setNotes('');

      // Refresh the list
      // const refresh = await fetch('http://localhost:5000/api/equipment', {
      const refresh = await fetch(`${import.meta.env.VITE_API_URL}/api/equipment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const refreshData = await refresh.json();

      if (!refresh.ok) {
        throw new Error(refreshData.message || 'Failed to refresh equipment');
      }

      setEquipmentList(refreshData.equipment.filter((item) => item.status === 'Checked Out'));
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="checkin">
      <h1>Check-In Form</h1>
      <p>Select equipment that is currently Checked Out and record its return.</p>

      {loading ? (
        <p>Loading checked-out equipment...</p>
      ) : equipmentList.length === 0 ? (
        <p>No equipment is currently checked out.</p>
      ) : (
        <form className="checkin-form" onSubmit={handleSubmit}>
          <label>
            Equipment
            <select
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              required
            >
              <option value="">-- Select equipment --</option>
              {equipmentList.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} ({item.serialNumber})
                </option>
              ))}
            </select>
          </label>

          <label>
            Condition on Return
            <select
              value={conditionOnReturn}
              onChange={(e) => setConditionOnReturn(e.target.value)}
              required
            >
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Needs Repair">Needs Repair</option>
              <option value="Damaged">Damaged</option>
            </select>
          </label>

          <label>
            Notes (optional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any damage or extra notes"
              rows="3"
            />
          </label>

          <button type="submit">Check In Equipment</button>
        </form>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default CheckIn;