import { useState } from 'react';
import './App.css';
import Navigation from './components/NavBar/Navbar';
import ConnectView from './components/Connect/Connect'
import Footer from './components/Footer/Footer';

function App() {
  const [joined, setJoined] = useState(false);
  return (
      <div className='App'> 
        <Navigation />
        <ConnectView />
        <Footer/>
      </div>
  );
}

export default App;