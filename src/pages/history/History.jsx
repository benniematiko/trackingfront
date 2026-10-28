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

  // Action Handlers
  const handleView = (tx) => {
    console.log('View transaction details:', tx);
    // TODO: Trigger view modal or navigate to detail view
  };

  const handleEdit = (tx) => {
    console.log('Edit transaction:', tx);
    // TODO: Trigger edit modal or open edit form
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction log?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      // Remove deleted item from local state
      setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="history-page-wrapper">
      <div className="history-container">
        <div className="history-header">
          <h1>Transaction History</h1>
          <p>This is the complete log of every equipment movement.</p>
        </div>

        {loading && <p className="history-status">Loading history...</p>}
        {error && <p className="history-status error">Error: {error}</p>}

        {!loading && !error && (
          <div className="table-responsive">
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-data">
                      No transactions yet. Try checking something out!
                    </td>
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
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleView(tx)}
                            title="View Transaction"
                          >
                            View
                          </button>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(tx)}
                            title="Edit Transaction"
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(tx._id)}
                            title="Delete Transaction"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;