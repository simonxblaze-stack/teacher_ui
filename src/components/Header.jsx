import { useState, useRef, useEffect } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/header.css";

export default function Header() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  //dropdown close na icon pawna click in
useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="profile-menu" ref={menuRef}>
        <img
          src="https://i.pravatar.cc/40"
          alt="profile"
          className="profile-img"
          onClick={() => setOpen(!open)}
        />
        {open && (
          <div className="dropdown">
            <div className="dropdown-header">
              <span className="dropdown-username">james</span>
              <img src="https://i.pravatar.cc/40" alt="profile" className="dropdown-avatar" />
            </div>
            <hr className="dropdown-divider" />
            <button onClick={() => {navigate("/teacher/profile"); setOpen(false); }}>
              Profile <span className="arrow">›</span>
            </button>
            <button onClick={() => {navigate("/teacher/change-password"); setOpen(false); }}>
              Change Password <span className="arrow">›</span>
            </button>
            <button onClick={() => {navigate("/"); setOpen(false); }}>
              Logout <span className="arrow">▷</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
