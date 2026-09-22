import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          Equipment Tracker
        </Link>
      </div>

      {user ? (
        <>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/equipment">Equipment</Link></li>
            <li><Link to="/checkout">Check-Out</Link></li>
            <li><Link to="/checkin">Check-In</Link></li>
            <li><Link to="/history">History</Link></li>
          </ul>

          <div className="user-info">
            <div className="user-badge">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </>
      ) : (
        <ul className="nav-links">
          <li>
            <Link to="/login" className="login-link">Login</Link>
          </li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;