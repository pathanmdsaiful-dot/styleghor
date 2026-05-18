import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 px-8 py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-2 text-black">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            System Secure
          </div>
          <Link to="/orders" className="hover:text-black transition-colors">Track Order</Link>
          <Link to="/support" className="hover:text-black transition-colors">Support</Link>
          <Link to="/payments" className="hover:text-black transition-colors">Payments</Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 grayscale border border-gray-100 rounded p-1 opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer bg-gray-50">
            <div className="w-8 h-5 bg-blue-800 rounded-sm"></div>
            <div className="w-8 h-5 bg-orange-600 rounded-sm"></div>
            <div className="w-8 h-5 bg-red-600 rounded-sm"></div>
          </div>
          <div className="w-[1px] h-4 bg-gray-200 hidden md:block"></div>
          <div className="text-[10px] text-gray-400 font-medium tracking-tight whitespace-nowrap">
            &copy; 2024 Style Ghor Premium. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
