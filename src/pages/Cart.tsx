import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ChevronLeft, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto py-20 bg-secondary/20 rounded-[3rem] border border-dashed border-gray-200">
          <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-8 opacity-20" />
          <h2 className="text-3xl font-serif font-bold mb-4 tracking-tight">Your bag is empty</h2>
          <p className="text-muted-foreground mb-12 px-10">Discover our latest collections and find something extraordinary to express your unique style.</p>
          <Button asChild size="lg" className="rounded-full px-12 h-14 bg-primary text-white hover:bg-accent border-none text-lg">
            <Link to="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 container mx-auto px-4">
      <div className="flex items-center gap-4 mb-12">
        <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
          <Link to="/shop"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Shopping Bag</h1>
        <span className="text-sm font-medium bg-secondary px-3 py-1 rounded-full text-muted-foreground">{items.length} items</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col sm:flex-row gap-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div className="w-full sm:w-40 aspect-[3/4] rounded-2xl overflow-hidden bg-secondary/30 shrink-0">
                  <img src={item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                
                <div className="flex-grow flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-serif font-bold tracking-tight hover:text-accent transition-colors"><Link to={`/product/${item.id}`}>{item.name}</Link></h4>
                      <p className="text-sm text-muted-foreground mt-2 font-medium tracking-wide uppercase">Standard Color / Medium</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={() => {
                        removeItem(item.id);
                        toast.error(`${item.name} removed from bag`);
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-end justify-between mt-8">
                    <div className="flex items-center bg-secondary/50 rounded-xl h-12 p-1 border border-gray-100">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-full rounded-lg"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-10 text-center font-bold font-mono">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-full rounded-lg"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xl font-bold font-mono">
                        ৳{((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">৳{(item.discountPrice || item.price).toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-[#1a1a1a] text-white rounded-[2.5rem] p-10 shadow-2xl sticky top-32">
            <h3 className="text-2xl font-serif font-bold mb-8 tracking-tight">Order Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400 font-medium">
                <span>Subtotal</span>
                <span className="text-white font-mono">৳{total().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 font-medium">
                <span>Estimated Shipping</span>
                <span className="text-white font-mono">৳15.00</span>
              </div>
              <div className="flex justify-between text-gray-400 font-medium">
                <span>Estimated Tax</span>
                <span className="text-white font-mono">৳0.00</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center mt-6">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-bold text-accent font-mono">৳{(total() + 15).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button asChild className="w-full h-14 rounded-2xl bg-white text-black hover:bg-accent hover:text-white border-none text-lg gap-2 shadow-lg">
                <Link to="/checkout">Checkout Now <ArrowRight className="w-5 h-5" /></Link>
              </Button>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 uppercase font-bold tracking-widest py-4">
                <CreditCard className="w-4 h-4" /> Secure Payment Guaranteed
              </div>
            </div>

            {/* Promo Code */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Promotional Code</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="STYLE2026" 
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent flex-grow font-mono"
                />
                <Button variant="outline" className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white hover:text-black">Apply</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
