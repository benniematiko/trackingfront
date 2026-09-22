import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Equipment.css';

const EMPTY_FORM = {
  name: '',
  type: '',
  category: 'General',
  serialNumber: '',
  status: 'In Store',
  condition: 'Good',
  location: 'Main Store',
  imageUrl: '',
  purchaseDate: '',
  purchasePrice: '',
  notes: '',
  lastMaintenanceDate: '',
  nextMaintenanceDate: '',
};

function Equipment() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [equipmentList, setEquipmentList] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search / filter / sort / pagination state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Add / edit form state
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      params.set('sortBy', sortBy);
      params.set('order', order);
      params.set('page', page);
      params.set('limit', limit);

      const response = await fetch(`http://localhost:5000/api/equipment?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch equipment');
      }

      setEquipmentList(data.equipment);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter, categoryFilter, sortBy, order, page, limit]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  // Reset to page 1 whenever search/filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || '',
      type: item.type || '',
      category: item.category || 'General',
      serialNumber: item.serialNumber || '',
      status: item.status || 'In Store',
      condition: item.condition || 'Good',
      location: item.location || 'Main Store',
      imageUrl: item.imageUrl || '',
      purchaseDate: item.purchaseDate ? item.purchaseDate.slice(0, 10) : '',
      purchasePrice: item.purchasePrice ?? '',
      notes: item.notes || '',
      lastMaintenanceDate: item.lastMaintenanceDate ? item.lastMaintenanceDate.slice(0, 10) : '',
      nextMaintenanceDate: item.nextMaintenanceDate ? item.nextMaintenanceDate.slice(0, 10) : '',
    });
    setShowForm(true);
    setFormError('');
  };

  const cancelForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowForm(false);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      ...formData,
      purchasePrice: formData.purchasePrice === '' ? undefined : Number(formData.purchasePrice),
      purchaseDate: formData.purchaseDate || undefined,
      lastMaintenanceDate: formData.lastMaintenanceDate || undefined,
      nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
    };

    try {
      const url = editingId
        ? `http://localhost:5000/api/equipment/${editingId}`
        : 'http://localhost:5000/api/equipment';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save equipment');
      }

      cancelForm();
      fetchEquipment();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/equipment/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete equipment');
      }

      fetchEquipment();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/equipment/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update status');
      }

      fetchEquipment();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const sortArrow = (field) => {
    if (sortBy !== field) return '';
    return order === 'asc' ? ' ▲' : ' ▼';
  };

  const getMaintenanceFlag = (item) => {
    if (!item.nextMaintenanceDate) return null;
    const due = new Date(item.nextMaintenanceDate);
    const now = new Date();
    const daysUntil = (due - now) / (1000 * 60 * 60 * 24);

    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 30) return 'due-soon';
    return null;
  };

  return (
    <div className="equipment">
      <h1>Equipment List</h1>

      {/* Search / Filter Bar */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name, type, or serial number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="In Store">In Store</option>
          <option value="Checked Out">Checked Out</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Retired">Retired</option>
        </select>

        <input
          type="text"
          placeholder="Filter by category..."
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />

        {isAdmin && (
          <button onClick={() => (showForm ? cancelForm() : setShowForm(true))}>
            {showForm ? 'Cancel' : '+ Add Equipment'}
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {isAdmin && showForm && (
        <form className="add-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit Equipment' : 'Add New Equipment'}</h2>

          {formError && <p className="error">{formError}</p>}

          <div className="form-grid">
            <input
              type="text"
              name="name"
              placeholder="Name (e.g. Excavator)"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
            <input
              type="text"
              name="type"
              placeholder="Type (e.g. Heavy Machinery)"
              value={formData.type}
              onChange={handleFormChange}
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="serialNumber"
              placeholder="Serial Number"
              value={formData.serialNumber}
              onChange={handleFormChange}
              required
              disabled={!!editingId}
              title={editingId ? 'Serial number cannot be changed after creation' : ''}
            />
            <select name="condition" value={formData.condition} onChange={handleFormChange}>
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Damaged">Damaged</option>
            </select>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleFormChange}
            />
            <input
              type="url"
              name="imageUrl"
              placeholder="Image URL (optional)"
              value={formData.imageUrl}
              onChange={handleFormChange}
            />
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleFormChange}
              title="Purchase date"
            />
            <input
              type="number"
              name="purchasePrice"
              placeholder="Purchase Price"
              min="0"
              step="0.01"
              value={formData.purchasePrice}
              onChange={handleFormChange}
            />
            <input
              type="date"
              name="lastMaintenanceDate"
              value={formData.lastMaintenanceDate}
              onChange={handleFormChange}
              title="Last maintenance date"
            />
            <input
              type="date"
              name="nextMaintenanceDate"
              value={formData.nextMaintenanceDate}
              onChange={handleFormChange}
              title="Next maintenance date"
            />
          </div>

          <textarea
            name="notes"
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={handleFormChange}
            rows="2"
          />

          <div className="form-actions">
            <button type="submit">{editingId ? 'Save Changes' : 'Add Equipment'}</button>
            <button type="button" onClick={cancelForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p>Loading equipment...</p>}
      {error && <p className="error">Error: {error}</p>}

      {!loading && !error && (
        <>
          <table className="equipment-table">
            <thead>
              <tr>
                <th>Image</th>
                <th onClick={() => handleSort('name')} className="sortable">
                  Name{sortArrow('name')}
                </th>
                <th>Type</th>
                <th>Category</th>
                <th>Serial Number</th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status{sortArrow('status')}
                </th>
                <th>Condition</th>
                <th>Location</th>
                <th>Checked Out To</th>
                <th onClick={() => handleSort('nextMaintenanceDate')} className="sortable">
                  Next Maintenance{sortArrow('nextMaintenanceDate')}
                </th>
                <th>Change Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {equipmentList.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 12 : 11}>No equipment found.</td>
                </tr>
              ) : (
                equipmentList.map((item) => {
                  const maintFlag = getMaintenanceFlag(item);
                  return (
                    <tr key={item._id} className={maintFlag ? `maint-${maintFlag}` : ''}>
                      <td>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="thumb" />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{item.name}</td>
                      <td>{item.type}</td>
                      <td>{item.category}</td>
                      <td>{item.serialNumber}</td>
                      <td>{item.status}</td>
                      <td>{item.condition}</td>
                      <td>{item.location}</td>
                      <td>{item.checkedOutTo ? item.checkedOutTo.name : '—'}</td>
                      <td>
                        {item.nextMaintenanceDate
                          ? new Date(item.nextMaintenanceDate).toLocaleDateString()
                          : '—'}
                        {maintFlag === 'overdue' && ' ⚠️ Overdue'}
                        {maintFlag === 'due-soon' && ' ⏰ Due soon'}
                      </td>
                      <td>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          disabled={!isAdmin}
                        >
                          <option value="In Store">In Store</option>
                          <option value="Checked Out">Checked Out</option>
                          <option value="Under Maintenance">Under Maintenance</option>
                          <option value="Retired">Retired</option>
                        </select>
                      </td>
                      {isAdmin && (
                        <td className="actions">
                          <button onClick={() => startEdit(item)}>Edit</button>
                          <button className="danger" onClick={() => handleDelete(item._id, item.name)}>
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages} ({total} items)
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Equipment;