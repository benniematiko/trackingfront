import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './History.css';

function History() {
  const { token } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // const response = await fetch('http://localhost:5000/api/transactions', {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load history');
        }

        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  // Helper to format dates nicely
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="history">
      <h1>Transaction History</h1>
      <p>This is the complete log of every equipment movement.</p>

      {loading && <p>Loading history...</p>}
      {error && <p className="error">Error: {error}</p>}

      {!loading && !error && (
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Equipment</th>
              <th>Taken By</th>
              <th>Site</th>
              <th>Expected Return</th>
              <th>Actual Return</th>
              <th>Condition</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="9">No transactions yet. Try checking something out!</td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id}>
                  <td>{formatDate(tx.createdAt)}</td>
                  <td>
                    <span className={tx.type === 'Check-Out' ? 'checkout-badge' : 'checkin-badge'}>
                      {tx.type}
                    </span>
                  </td>
                  <td>
                    {tx.equipment
                      ? `${tx.equipment.name} (${tx.equipment.serialNumber})`
                      : 'Unknown'}
                  </td>
                  <td>{tx.takenBy}</td>
                  <td>{tx.constructionSite || '-'}</td>
                  <td>{formatDate(tx.expectedReturnDate)}</td>
                  <td>{formatDate(tx.actualReturnDate)}</td>
                  <td>{tx.conditionOnReturn || '-'}</td>
                  <td>{tx.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default History;