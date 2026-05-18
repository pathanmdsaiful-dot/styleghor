import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { CreditCard, Truck, ShieldCheck, ArrowRight, ChevronLeft, MapPin, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Pay securely with your card' },
  { id: 'bkash', name: 'bKash', icon: Wallet, description: 'Mobile banking payment' },
  { id: 'nagad', name: 'Nagad', icon: Wallet, description: 'Mobile banking payment' },
  { id: 'cod', name: 'Cash on Delivery', icon: Truck, description: 'Pay when you receive' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Form states
  const [address, setAddress] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: 'Dhaka',
    zipCode: '',
  });

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please login to place an order");
      navigate('/auth');
      return;
    }

    if (!address.phone || !address.street || !address.zipCode) {
      toast.error("Please fill in all shipping details");
      return;
    }

    try {
      setLoading(true);
      
      const newOrderNumber = await runTransaction(db, async (transaction) => {
        const metadataRef = doc(db, 'metadata', 'orders');
        const metadataSnap = await transaction.get(metadataRef);
        
        let nextNumber = 1;
        if (metadataSnap.exists()) {
          nextNumber = metadataSnap.data().lastOrderNumber + 1;
          transaction.update(metadataRef, { lastOrderNumber: nextNumber });
        } else {
          transaction.set(metadataRef, { lastOrderNumber: 1 });
        }
        return nextNumber;
      });

      const orderData = {
        orderNumber: newOrderNumber,
        userId: user.uid,
        items,
        total: total() + 15,
        status: 'pending',
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid', // Mocking payment success for card/bkash
        shippingAddress: address,
        createdAt: new Date().toISOString(), // Keeping string for easy display as per user request (with time)
        serverTimestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      toast.success("Order placed successfully!");
      clearCart();
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 text-center">
        <h2 className="text-3xl font-serif font-bold mb-4">Your bag is empty</h2>
        <Button onClick={() => navigate('/shop')} className="rounded-full px-10">Go Shopping</Button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 container mx-auto px-4">
      <div className="flex items-center gap-4 mb-12">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/cart')}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-4xl font-serif font-bold tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          {/* Shipping Address */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white w-10 h-10 rounded-2xl flex items-center justify-center font-bold">1</div>
              <h3 className="text-2xl font-serif font-bold tracking-tight">Shipping Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  className="rounded-xl h-12" 
                  value={address.fullName} 
                  onChange={(e) => setAddress({...address, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  className="rounded-xl h-12" 
                  value={address.email}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  className="rounded-xl h-12" 
                  placeholder="+880"
                  value={address.phone}
                  onChange={(e) => setAddress({...address, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input 
                  id="zipCode" 
                  className="rounded-xl h-12"
                  value={address.zipCode}
                  onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input 
                  id="street" 
                  className="rounded-xl h-12"
                  value={address.street}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white w-10 h-10 rounded-2xl flex items-center justify-center font-bold">2</div>
              <h3 className="text-2xl font-serif font-bold tracking-tight">Payment Method</h3>
            </div>

            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAYMENT_METHODS.map((method) => (
                <Label
                  key={method.id}
                  className={`flex items-start gap-4 p-6 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === method.id ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1">
                      <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-bold text-lg">{method.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </section>

          <div className="flex items-center gap-4 p-6 bg-green-50 text-green-800 rounded-3xl border border-green-100">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">Your data is encrypted and protected. We use state-of-the-art security measures to ensure your transactions are safe.</p>
          </div>
        </div>

        {/* Review & Pay */}
        <div className="lg:col-span-4">
          <Card className="rounded-[2.5rem] border-none shadow-2xl p-4 sticky top-32 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-serif font-bold">Review Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-secondary shrink-0">
                      <img src={item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h5 className="text-sm font-bold line-clamp-1">{item.name}</h5>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">৳{((item.discountPrice || item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono text-black">৳{total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping Fee</span>
                  <span className="font-mono text-black">৳15.00</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
                  <span className="text-lg font-bold">Order Total</span>
                  <span className="text-2xl font-bold text-accent font-mono">৳{(total() + 15).toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg gap-2 shadow-xl shadow-primary/20"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place My Order'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
