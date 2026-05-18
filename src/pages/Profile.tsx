import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Order } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { LogOut, Package, Settings, CreditCard, MapPin, ChevronRight, Clock, CheckCircle2, Truck, AlertCircle, LayoutDashboard, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const STATUS_ICONS: Record<string, any> = {
  pending: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
  processing: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
  shipped: { icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  delivered: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  cancelled: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, isAdmin } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    toast.success("Logged out successfully");
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="pt-32 pb-20 container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
            <div className="h-32 bg-primary relative">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-accent text-white text-2xl font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <CardContent className="pt-16 pb-10 text-center">
              <h3 className="text-2xl font-serif font-bold tracking-tight">{user.displayName || 'Ghori Fashionista'}</h3>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              
              {isAdmin && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest border border-accent/20">
                  <Database className="w-3 h-3" /> System Admin
                </div>
              )}
              
              <div className="flex justify-center gap-3 mt-8">
                {isAdmin && (
                  <Button variant="default" size="sm" className="rounded-xl h-10 px-6 gap-2 bg-accent hover:bg-accent/90" onClick={() => navigate('/admin')}>
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Button>
                )}
                <Button variant="outline" size="sm" className="rounded-xl border-gray-100 h-10 px-6 gap-2">
                  <Settings className="w-4 h-4" /> Edit Profile
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4 rounded-xl text-red-500 hover:bg-red-50 h-10 px-6 gap-2 justify-center" onClick={handleLogout}>
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {[
              { label: 'My Orders', icon: Package, active: true },
              { label: 'Payment Methods', icon: CreditCard },
              { label: 'Shipping Addresses', icon: MapPin },
            ].map((item, i) => (
              <Button 
                key={i}
                variant={item.active ? 'secondary' : 'ghost'} 
                className={`w-full justify-between h-14 rounded-2xl px-6 ${item.active ? 'bg-primary text-white hover:bg-primary' : 'hover:bg-secondary'}`}
              >
                <div className="flex items-center gap-4">
                  <item.icon className="w-5 h-5" />
                  <span className="font-semibold">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-10">
          <div>
            <h2 className="text-3xl font-serif font-bold tracking-tight mb-8">Order History</h2>
            
            <div className="space-y-6">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-40 bg-secondary/30 rounded-3xl animate-pulse" />
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => {
                  const status = STATUS_ICONS[order.status] || STATUS_ICONS.pending;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div className="flex items-center gap-5">
                          <div className={`p-4 ${status.bg} ${status.color} rounded-2xl shrink-0`}>
                            <status.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h4>
                              <Badge className={`${status.bg} ${status.color} border-none rounded-full px-4 text-[10px] uppercase font-bold tracking-wider`}>
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Total Amount</p>
                          <h5 className="text-2xl font-bold font-mono tracking-tighter text-accent">৳{order.total.toFixed(2)}</h5>
                        </div>
                      </div>

                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {order.items.map((item: any, i) => (
                          <div key={i} className="relative w-24 h-32 rounded-2xl overflow-hidden bg-secondary/50 shrink-0">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                              {item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-8 flex justify-between items-center border-t border-gray-50 pt-8">
                        <div className="flex gap-10">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Payment</p>
                            <p className="text-sm font-semibold capitalize">{order.paymentMethod}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Destination</p>
                            <p className="text-sm font-semibold truncate max-w-[150px]">{order.shippingAddress.city}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="rounded-xl px-10 h-12 border-gray-200 hover:bg-secondary">View Details</Button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-32 bg-secondary/10 rounded-[3rem] border border-dashed border-gray-200">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                  <h3 className="text-2xl font-serif font-bold mb-3">No Orders Found</h3>
                  <p className="text-muted-foreground mb-8">You haven't made any purchases with us yet.</p>
                  <Button asChild className="rounded-full px-10 h-14" size="lg">
                    <a href="/shop">Go Shopping Now</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
