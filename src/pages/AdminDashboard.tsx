import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Order } from '../types';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, LayoutDashboard, Package, ShoppingCart, Users, Database, Save, FileText, Download, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import Barcode from 'react-barcode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


export default function AdminDashboard() {
  const { user, isAdmin } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  
  const EMPTY_PRODUCT: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    category: 'Men',
    stock: 0,
    images: [''],
    isFeatured: false,
    ratings: 5,
    reviewsCount: 0,
    isNewArrival: true,
  };

  const [formData, setFormData] = useState<Partial<Product>>(EMPTY_PRODUCT);
  
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('name')));
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'products');
    }
  };

  const fetchOrders = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'products', id));
        toast.success("Product deleted successfully");
        await fetchProducts();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData(EMPTY_PRODUCT);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  };

  const handleOpenOrder = (order: Order) => {
    setViewingOrder(order);
    setIsInvoiceOpen(true);
  };

  const downloadInvoice = async () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;
    
    try {
      setLoading(true);
      
      // Ensure images are loaded
      const images = element.getElementsByTagName('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(imagePromises);

      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));
      pdf.save(`invoice_styleghor_${viewingOrder?.orderNumber || viewingOrder?.id.slice(0, 6)}.pdf`);
      toast.success("Invoice downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct?.id) {
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          updatedAt: new Date().toISOString()
        });
        toast.success("Product updated successfully");
      } else {
        await addDoc(collection(db, 'products'), {
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          createdAt: new Date().toISOString()
        });
        toast.success("Product added successfully");
      }
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, editingProduct ? `products/${editingProduct.id}` : 'products');
    } finally {
      setLoading(false);
    }
  };

  const totalSales = orders.reduce((acc, order) => acc + (order.total || 0), 0);
  const totalCustomers = new Set(orders.map(o => o.userId)).size;

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-secondary/30">
        <Card className="w-96 rounded-3xl p-10 text-center shadow-xl border-none">
          <Database className="w-16 h-16 mx-auto mb-6 text-red-500 opacity-50" />
          <h2 className="text-2xl font-serif font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-8">This area is reserved for administrators only.</p>
          <Button onClick={() => window.location.href = '/'} variant="secondary" className="w-full rounded-2xl">Return Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Admin Command Center</h1>
          <p className="text-muted-foreground">Manage your boutique, orders, and elite clientele.</p>
        </div>
        <div className="flex gap-4">
          <Button className="rounded-2xl gap-2 bg-primary" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-8 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Classic Silk Shirt"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  required
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Elite">Elite</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (৳)</Label>
                <Input 
                  id="price" 
                  type="number"
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input 
                  id="stock" 
                  type="number"
                  value={formData.stock} 
                  onChange={e => setFormData({...formData, stock: Number(e.target.value)})} 
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-normal"
                placeholder="Describe the product details and material..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input 
                id="image" 
                value={formData.images?.[0]} 
                onChange={e => setFormData({...formData, images: [e.target.value]})} 
                placeholder="https://images.unsplash.com/..."
                className="rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input 
                type="checkbox" 
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                className="w-5 h-5 rounded-lg border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">Mark as Featured Product</Label>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl px-8">Cancel</Button>
              <Button type="submit" className="rounded-xl px-8 gap-2 bg-primary" disabled={loading}>
                {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Product</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl p-0 bg-white border-none shadow-2xl flex flex-col">
          <div className="sticky top-0 z-50 p-4 bg-secondary/80 backdrop-blur-md border-b flex justify-between items-center sm:px-8 shrink-0">
            <h3 className="font-serif font-bold text-xl">Digital Invoice</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-xl gap-2 bg-white" onClick={printInvoice}>
                <Printer className="w-4 h-4" /> Print
              </Button>
              <Button size="sm" className="rounded-xl gap-2 bg-primary" onClick={downloadInvoice} disabled={loading}>
                <Download className="w-4 h-4" /> {loading ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-grow h-full custom-scrollbar bg-white">
            <div id="invoice-content" className="p-8 sm:p-12 bg-white text-gray-800 min-h-[1100px]">
            {viewingOrder && (
              <div className="space-y-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tighter text-primary mb-2">STYLE<span className="text-accent">GHOR</span></h2>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Premium Elite Fashion Boutique</p>
                    <div className="mt-6 text-sm text-gray-500 space-y-1">
                      <p>Banani, Dhaka-1213, Bangladesh</p>
                      <p>Email: support@styleghor.com</p>
                      <p>Web: www.styleghor.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-5xl font-serif font-black text-primary mb-4 tracking-tighter">INVOICE</h1>
                    <div className="space-y-1 text-sm">
                      <p className="font-bold">Order #: <span className="text-accent font-mono text-xl">#{viewingOrder.orderNumber || viewingOrder.id.slice(0, 6)}</span></p>
                      <p className="text-gray-500">Date: {formatDateTime(viewingOrder.createdAt)}</p>
                      <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold mt-2">
                        Status: <span className={`px-2 py-0.5 rounded-md ${viewingOrder.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{viewingOrder.status}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 border-t border-gray-100 pt-10">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Bill To:</h4>
                    <div className="space-y-2">
                      <p className="font-bold text-lg text-primary">{viewingOrder.shippingAddress.fullName}</p>
                      <div className="text-sm text-gray-500 font-medium leading-relaxed">
                        <p>{viewingOrder.shippingAddress.street}</p>
                        <p>{viewingOrder.shippingAddress.city} - {viewingOrder.shippingAddress.zipCode}</p>
                        <p className="mt-2 text-primary">Phone: {viewingOrder.shippingAddress.phone}</p>
                        <p>Email: {viewingOrder.shippingAddress.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary/30 p-6 rounded-3xl">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Payment Details:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Payment Method:</span>
                        <span className="font-bold uppercase">{viewingOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Transaction Status:</span>
                        <span className={`font-bold uppercase ${viewingOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                          {viewingOrder.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-3xl overflow-hidden mt-8">
                  <Table>
                    <TableHeader className="bg-secondary/50">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="py-5 font-bold text-gray-600">Product Particulars</TableHead>
                        <TableHead className="text-center font-bold text-gray-600">Price</TableHead>
                        <TableHead className="text-center font-bold text-gray-600">Qty</TableHead>
                        <TableHead className="text-right font-bold text-gray-600">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingOrder.items.map((item, id) => (
                        <TableRow key={id} className="border-gray-50">
                          <TableCell className="py-4">
                            <p className="font-bold text-primary">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium italic mt-0.5">Item Code: {item.id ? item.id.slice(0, 10) : 'N/A'}</p>
                          </TableCell>
                          <TableCell className="text-center font-mono py-4">৳{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-center font-medium py-4">{item.quantity}</TableCell>
                          <TableCell className="text-right font-bold py-4">৳{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-start gap-12 pt-4">
                  <div className="flex-grow pt-4">
                    <div className="mt-8 flex flex-col items-start gap-4">
                      <Barcode 
                        value={`SG-ORD-${viewingOrder.orderNumber || viewingOrder.id.slice(0, 6)}`} 
                        width={1.5}
                        height={40}
                        fontSize={12}
                        margin={0}
                      />
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Authorized Scan Barcode</p>
                    </div>
                  </div>
                  <div className="w-80 space-y-4 pt-4 border-t-2 border-primary">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-500">Subtotal</span>
                      <span className="font-bold">৳{(viewingOrder.total - 15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-500">Premium Shipping</span>
                      <span className="font-bold">৳15.00</span>
                    </div>
                    <div className="flex justify-between text-lg pt-4 border-t border-gray-100">
                      <span className="font-serif font-black uppercase text-primary tracking-tighter">Grand Total</span>
                      <span className="font-mono font-black text-2xl text-accent">৳{viewingOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-20 text-center space-y-4">
                  <div className="w-16 h-[2px] bg-accent mx-auto"></div>
                  <p className="text-sm font-serif italic text-gray-400">"Redefining Elegance, One Order at a Time"</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Thank you for choosing Style Ghor Premium</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Sales</p>
              <h4 className="text-2xl font-bold font-mono">৳{totalSales.toLocaleString()}</h4>
            </div>
          </div>
        </Card>
        <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Orders</p>
              <h4 className="text-2xl font-bold font-mono">{orders.length}</h4>
            </div>
          </div>
        </Card>
        <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Customers</p>
              <h4 className="text-2xl font-bold font-mono">{totalCustomers}</h4>
            </div>
          </div>
        </Card>
        <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Inventory</p>
              <h4 className="text-2xl font-bold font-mono">{products.length} Products</h4>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="bg-white p-2 h-auto rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-x-auto justify-start inline-flex">
          <TabsTrigger value="products" className="rounded-xl px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Products</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-xl px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Orders</TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Users</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Store Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-0">
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop'} alt="" className="w-12 h-12 object-cover rounded-xl" />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell><span className="bg-secondary px-3 py-1 rounded-full text-xs font-semibold">{product.category}</span></TableCell>
                    <TableCell className="font-mono">৳{product.price}</TableCell>
                    <TableCell>
                      <span className={`font-mono ${product.stock < 10 ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 hover:bg-blue-50 hover:text-blue-600" onClick={() => handleOpenEdit(product)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 hover:bg-red-50 hover:text-red-600" onClick={() => deleteProduct(product.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      <p className="text-muted-foreground font-medium">No orders found.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm font-bold text-accent">#{order.orderNumber || order.id.slice(0, 6)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{order.shippingAddress.fullName}</span>
                          <span className="text-xs text-gray-500">{order.shippingAddress.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-primary">৳{order.total?.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 font-medium">
                        {formatDateTime(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-3">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-lg h-8 w-8 hover:bg-secondary hover:text-accent"
                            onClick={() => handleOpenOrder(order)}
                            title="View Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>

                          <select 
                            className="bg-secondary/50 border-none rounded-lg text-[10px] font-bold px-2 py-1 outline-none focus:ring-1 focus:ring-primary/20 h-8"
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
