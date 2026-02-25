import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Search, PlusCircle, LayoutDashboard, Menu, X, BarChart3 } from 'lucide-react';
import api from './api';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import Items from './pages/Items';
import ReportItem from './pages/ReportItem';
import EditItem from './pages/EditItem';
import ItemDetails from './pages/ItemDetails';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      api.get('/claims')
        .then(res => {
          const pending = res.data.receivedClaims.filter(
            c => c.status === 'pending' && c.itemId.status !== 'recovered'
          );
          setPendingClaimsCount(pending.length);
        })
        .catch(err => console.error('Failed to fetch claims', err));
    } else {
      setPendingClaimsCount(0);
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="glass sticky top-0 z-50  border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <Search className="h-8 w-8 text-primary-600" />
                <span className="font-bold text-xl text-gray-900 tracking-tight">Campus<span className="text-primary-600">Find</span></span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden sm:flex sm:items-center sm:gap-6">
              <Link to="/items" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Browse Items</Link>
              <Link to="/statistics" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Statistics</Link>
              {user ? (
                <>
                  <Link to="/report" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 font-medium transition-colors">
                    <PlusCircle className="w-4 h-4" /> Report Item
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 font-medium transition-colors relative">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                    {pendingClaimsCount > 0 && (
                      <span className="absolute -top-1.5 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {pendingClaimsCount}
                      </span>
                    )}
                  </Link>
                  <div className="relative ml-4 flex items-center gap-4 group">
                    <Link to="/settings" className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-3 py-1.5 focus:outline-none">
                      <User className="w-4 h-4" /> {user.name}
                    </Link>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors" title="Log out">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Log in</Link>
                  <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-primary-500/20">Sign up</Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="sm:hidden glass-dark absolute w-full animate-fade-in shadow-xl rounded-b-xl border-t-0 p-4 flex flex-col gap-4">
            <Link to="/items" onClick={() => setIsMenuOpen(false)} className="text-gray-200 hover:text-white font-medium">Browse Items</Link>
            <Link to="/statistics" onClick={() => setIsMenuOpen(false)} className="text-gray-200 hover:text-white font-medium">Statistics</Link>
            {user ? (
              <>
                <Link to="/report" onClick={() => setIsMenuOpen(false)} className="text-gray-200 hover:text-white font-medium">Report Item</Link>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-gray-200 hover:text-white font-medium flex items-center justify-between">
                  <span>Dashboard</span>
                  {pendingClaimsCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {pendingClaimsCount}
                    </span>
                  )}
                </Link>
                <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="text-gray-200 hover:text-white font-medium">Account Settings</Link>
                <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="text-left text-red-400 hover:text-red-300 font-medium">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-gray-200 hover:text-white font-medium">Log in</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="text-gray-200 hover:text-white font-medium">Sign up</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <main className="flex-1 w-full flex flex-col animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/:id" element={<ItemDetails user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/settings" element={<Settings user={user} setUser={setUser} />} />
          <Route path="/report" element={<ReportItem user={user} />} />
          <Route path="/edit-item/:id" element={<EditItem user={user} />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </main>

    </div>
  );
}

export default App;
