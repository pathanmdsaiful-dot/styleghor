import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search as SearchIcon, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 glass-nav ${
        isScrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-extrabold tracking-tighter text-primary">
            STYLE<span className="text-accent">GHOR</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-xs font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors">Home</Link>
            <Link to="/shop" className="text-xs font-bold uppercase tracking-widest text-[#1D1D1F] hover:text-accent transition-colors">Shop</Link>
            <Link to="/shop?category=Men" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#1D1D1F] transition-colors">Men</Link>
            <Link to="/shop?category=Women" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#1D1D1F] transition-colors">Women</Link>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative w-full group">
            <Input
              type="text"
              placeholder="Search premium products..."
              className="w-full bg-gray-100 border-none rounded-full h-10 px-12 text-sm focus-visible:ring-2 focus-visible:ring-accent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent transition-colors" />
          </form>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          {user && (
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Welcome</span>
              <span className="text-xs font-semibold">{user.displayName || 'Client'}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link to="/wishlist" className="p-2 hover:bg-secondary rounded-full relative transition-colors group">
              <Heart className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</span>
            </Link>

            <Link to="/cart" className="p-2 hover:bg-secondary rounded-full relative transition-colors group">
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-md shadow-accent/20">
                  {cartItems.length}
                </span>
              )}
            </Link>

            <Link to={user ? "/profile" : "/auth"} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <User className="w-5 h-5 text-gray-700" />
            </Link>
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden flex items-center space-x-3">
          <Link to="/cart" className="p-2 relative">
            <ShoppingBag className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartItems.length}
              </span>
            )}
          </Link>
          <Sheet>
            <SheetTrigger>
              <div className="p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer md:hidden">
                <Menu className="w-6 h-6" />
              </div>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-6 mt-10">
                <Link to="/" className="text-lg font-medium">Home</Link>
                <Link to="/shop" className="text-lg font-medium">Shop</Link>
                <Link to="/wishlist" className="text-lg font-medium">Wishlist</Link>
                <Link to="/profile" className="text-lg font-medium">Profile</Link>
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-secondary/50 border-none rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
