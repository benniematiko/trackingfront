import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <h1>Construction Equipment Tracker</h1>
        <p>Keep track of every tool and machine on your construction sites.</p>
      </header>

      <div className="feature-cards">
        <div className="card">
          <h2>Equipment List</h2>
          <p>See all your equipment, add new items, and change their status.</p>
          <Link to="/equipment" className="card-button">Go to Equipment</Link>
        </div>

        <div className="card">
          <h2>Check-Out</h2>
          <p>Record who is taking equipment and which site it is going to.</p>
          <Link to="/checkout" className="card-button">Go to Check-Out</Link>
        </div>

        <div className="card">
          <h2>Check-In</h2>
          <p>Record when equipment comes back and its condition.</p>
          <Link to="/checkin" className="card-button">Go to Check-In</Link>
        </div>

        <div className="card">
          <h2>History</h2>
          <p>View the full log of every movement of equipment.</p>
          <Link to="/history" className="card-button">Go to History</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;