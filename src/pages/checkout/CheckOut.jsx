import { useState, useEffect } from 'react';
import './CheckOut.css';

const CheckOut = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [formData, setFormData] = useState({
    takenBy: '',
    constructionSite: '',
    expectedReturnDate: '',
    notes: '',
  });

  const token = localStorage.getItem('token');

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const fetchAvailableEquipment = async () => {
    setLoading(true);
    setError('');

    try {
      if (!token) {
        throw new Error('No token found. Please login first.');
      }

      const res = await fetch('http://localhost:5000/api/equipment', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch equipment');
      }

      if (!Array.isArray(data.equipment)) {
        throw new Error('Invalid data format from server');
      }

      const available = data.equipment.filter((item) => item.status === 'In Store');
      setEquipment(available);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedEquipment) {
      setError('Please select an equipment');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/transactions/checkout', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          equipmentId: selectedEquipment,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to check out equipment');
      }

      alert('Equipment checked out successfully!');

      setSelectedEquipment('');
      setFormData({
        takenBy: '',
        constructionSite: '',
        expectedReturnDate: '',
        notes: '',
      });

      fetchAvailableEquipment();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAvailableEquipment();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="checkout-container">
      <h1>Check Out Equipment</h1>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading available equipment...</p>
      ) : (
        <form onSubmit={handleCheckOut} className="checkout-form">
          <div className="form-group">
            <label>Select Equipment</label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              required
            >
              <option value="">-- Select Equipment --</option>
              {equipment.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} ({item.serialNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Taken By</label>
            <input
              type="text"
              name="takenBy"
              value={formData.takenBy}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Construction Site</label>
            <input
              type="text"
              name="constructionSite"
              value={formData.constructionSite}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Expected Return Date</label>
            <input
              type="date"
              name="expectedReturnDate"
              value={formData.expectedReturnDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <button type="submit" className="submit-btn">
            Check Out Equipment
          </button>
        </form>
      )}
    </div>
  );
};

export default CheckOut;