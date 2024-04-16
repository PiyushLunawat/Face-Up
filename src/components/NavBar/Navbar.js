// Navigation.js
import React  from 'react';
import "./Navbar.css";
import logo from "../../assets/user-icons.png";
import { useState } from "react";

function Navigation() {

  const [display, setDisplay] = useState(false);
  let [window, setWindow] = useState("Reservation");


  return (
    <nav className="navbar-container">
        <img src={logo} alt="B" className="logo"></img>
        <h1>Face Up</h1>

      </nav>
  );
}

export default Navigation;
