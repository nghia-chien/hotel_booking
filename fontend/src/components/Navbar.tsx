import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between">
        <Link to="/" className="text-xl font-bold">
          HotelBooking
        </Link>

        <div className="space-x-6">
          <Link to="/rooms">Rooms</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;