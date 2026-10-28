import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile drawer automatically on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Prevent background body scrolling when the 80% mobile menu drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <nav className="navbar">
      <div className="mobile-backdrop" onClick={() => setIsMenuOpen(false)}></div>
      <div className="navbar-content">
        {/* Brand / Logo */}
        <div className="navbar-left">
          <Link to="/" className="logo">
            Interior Consult Limited
          </Link>
        </div>

        {/* Desktop Links & Logged-in Menu */}
        {user ? (
          <div className={`nav-center ${isMenuOpen ? 'active' : ''}`}>
            {/* Backdrop overlay for focus on mobile drawer */}
            
            
            <ul className="nav-links">
              <li style={{ '--item-index': 1 }}><Link to="/">Home</Link></li>
              <li style={{ '--item-index': 2 }}><Link to="/equipment">Equipment</Link></li>
              <li style={{ '--item-index': 3 }}><Link to="/checkout">Check-Out</Link></li>
              <li style={{ '--item-index': 4 }}><Link to="/checkin">Check-In</Link></li>
              <li style={{ '--item-index': 5 }}><Link to="/history">History</Link></li>
            </ul>

            {/* Mobile-only profile details inside the drawer */}
            <div className="mobile-user-section" style={{ '--item-index': 6 }}>
              <div className="mobile-user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn mobile-logout">
                Logout
              </button>
            </div>
          </div>
        ) : null}

        {/* Right Section (Login button for logged out, User badge for logged in on Desktop) */}
        <div className="navbar-right-end">
          {user ? (
            <div className="user-info desktop-only">
              <div className="user-badge">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <ul className="nav-links login-wrapper">
              <li>
                <Link to="/login" className="login-link">Login</Link>
              </li>
            </ul>
          )}

          {/* Hamburger Toggle Button */}
          {user && (
            <button
              className={`hamburger-btn ${isMenuOpen ? 'open' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle Mobile Menu"
              aria-expanded={isMenuOpen}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;