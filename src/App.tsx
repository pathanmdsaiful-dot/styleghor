import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthStore } from './store/authStore';
import { Toaster } from './components/ui/sonner';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import Search from './pages/Search';
import Wishlist from './pages/Wishlist';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import { motion, AnimatePresence } from 'motion/react';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { toast } from 'sonner';

export default function App() {
  const { setUser, setAdmin, isAdmin } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + A
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShowAdminLogin(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple ID/Password check as requested
    if (adminId === 'styleghor' && adminPassword === 'ghor2026') {
      setAdmin(true);
      setShowAdminLogin(false);
      toast.success("Welcome back, Master Artisan.");
      setAdminId('');
      setAdminPassword('');
    } else {
      toast.error("Unauthorized access attempt documented.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Check admin status
        let isAdmin = firebaseUser.email === 'pathanmdsaiful@gmail.com';
        
        try {
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (adminDoc.exists()) {
            isAdmin = true;
          } else if (isAdmin) {
            // If email matches but no doc, create the doc
            await setDoc(doc(db, 'admins', firebaseUser.uid), {
              email: firebaseUser.email,
              role: 'super-admin',
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Admin check failed:", error);
        }
        
        setAdmin(isAdmin);

        // Create user profile if it doesn't exist
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: 'customer',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
        setAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAdmin]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/search" element={<Search />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />

        {/* Secret Admin Login Overlay */}
        <AnimatePresence>
          {showAdminLogin && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm bg-white rounded-[2rem] p-10 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
                
                <button 
                  onClick={() => setShowAdminLogin(false)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-primary transition-colors font-bold"
                >
                  ESC
                </button>

                <div className="text-center mb-8">
                  <h2 className="text-3xl font-serif font-black tracking-tighter text-primary mb-2">RESTRICTED</h2>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">Internal Access Only</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Access ID</label>
                    <Input 
                      type="text" 
                      placeholder="Identified Code" 
                      className="rounded-2xl bg-secondary/30 border-none h-14 px-6 focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Key Phrase</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="rounded-2xl bg-secondary/30 border-none h-14 px-6 focus:ring-2 focus:ring-accent/20 transition-all"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold tracking-widest shadow-lg shadow-primary/20">
                    AUTHORIZE ACCESS
                  </Button>
                </form>

                <p className="mt-8 text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-loose">
                  Unauthorized access is strictly prohibited.<br />Style Ghor Security Systems &copy; 2026
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}
