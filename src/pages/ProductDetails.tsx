import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Heart, ShoppingBag, Star, Share2, Truck, RefreshCw, ShieldCheck, ChevronRight, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(productData);
          
          // Fetch related
          const relatedQuery = query(
            collection(db, 'products'),
            where('category', '==', productData.category),
            limit(4)
          );
          const relatedSnap = await getDocs(relatedQuery);
          setRelatedProducts(
            relatedSnap.docs
              .map(d => ({ id: d.id, ...d.data() } as Product))
              .filter(p => p.id !== id)
          );
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images?.[0] || '',
      quantity: quantity,
    });
    toast.success(`${quantity} ${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-pulse">
          <div className="bg-secondary/30 rounded-3xl aspect-square" />
          <div className="space-y-6">
            <div className="h-4 bg-secondary/30 rounded w-1/4" />
            <div className="h-10 bg-secondary/30 rounded w-3/4" />
            <div className="h-8 bg-secondary/30 rounded w-1/4" />
            <div className="h-32 bg-secondary/30 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 text-center">
        <h2 className="text-3xl font-serif font-bold mb-4">Product Not Found</h2>
        <Button asChild className="rounded-full">
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 container mx-auto px-4">
      <div className="mb-8 flex items-center text-xs text-muted-foreground uppercase tracking-widest gap-2">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-primary font-bold">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
        {/* Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <motion.div 
            layoutId={`img-${product.id}`}
            className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-secondary/30"
          >
            <img 
              src={product.images?.[selectedImage] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop'} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {product.images?.map((img, i) => (
              <button 
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`flex-shrink-0 w-24 h-32 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-accent shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop'} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary" className="bg-accent/10 text-accent border-none rounded-full px-4 py-1 font-bold text-[10px] uppercase tracking-wider">{product.category}</Badge>
              {product.isNewArrival && <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] uppercase tracking-wider">New Arrival</Badge>}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < (product.ratings || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm font-semibold ml-2">({product.reviewsCount || 0} Reviews)</span>
              </div>
              <div className="h-4 w-[1px] bg-gray-200" />
              <div className="flex items-center gap-2 text-green-600">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">In Stock ({product.stock})</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold font-mono">
              ৳{(product.discountPrice || product.price).toFixed(2)}
            </span>
            {product.discountPrice && (
              <span className="text-xl text-muted-foreground line-through font-mono mb-1">
                ৳{product.price.toFixed(2)}
              </span>
            )}
            {product.discountPrice && (
              <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-lg mb-2">
                Save ৳{ (product.price - product.discountPrice).toFixed(2) }
              </span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed text-lg font-light">{product.description}</p>

          {/* Variants */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Select Size</h4>
              <div className="flex gap-3">
                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold transition-all ${selectedSize === size ? 'bg-primary border-primary text-white shadow-lg scale-110' : 'border-gray-100 hover:border-accent'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex items-center bg-secondary/50 rounded-2xl h-14 p-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-full rounded-xl"
                onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-full rounded-xl"
                onClick={() => setQuantity(q => q + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <Button 
              className="flex-grow h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg gap-3 shadow-xl shadow-primary/20"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-5 h-5" /> Add to Shopping Bag
            </Button>
            
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-gray-200">
              <Heart className="w-6 h-6 hover:fill-red-500 hover:text-red-500 transition-colors" />
            </Button>
          </div>

          {/* Delivery & Returns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
            <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-3xl">
              <Truck className="w-5 h-5 text-accent mt-1" />
              <div>
                <h5 className="text-sm font-bold">Fast Delivery</h5>
                <p className="text-xs text-muted-foreground mt-1">Free shipping on orders over ৳150. Delivery in 2-4 days.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-3xl">
              <RefreshCw className="w-5 h-5 text-accent mt-1" />
              <div>
                <h5 className="text-sm font-bold">Easy Returns</h5>
                <p className="text-xs text-muted-foreground mt-1">30-day hassle-free return policy. We care about your satisfaction.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <section className="mb-24">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="bg-white p-2 h-auto rounded-2xl shadow-sm border border-gray-100 mb-8 w-full justify-start overflow-x-auto">
            <TabsTrigger value="details" className="rounded-xl px-12 h-12 data-[state=active]:bg-primary data-[state=active]:text-white">Product Details</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl px-12 h-12 data-[state=active]:bg-primary data-[state=active]:text-white">Reviews ({product.reviewsCount})</TabsTrigger>
            <TabsTrigger value="shipping" className="rounded-xl px-12 h-12 data-[state=active]:bg-primary data-[state=active]:text-white">Shipping & Returns</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="bg-white p-10 rounded-3xl border border-gray-50 shadow-sm">
            <div className="max-w-4xl prose prose-gray">
              <h3 className="text-2xl font-serif font-bold mb-6">About the Collection</h3>
              <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                {product.description} This piece represents the pinnacle of our design philosophy at Style Ghor. We use only the finest materials sourced responsibly from around the globe to ensure that each item not only looks premium but feels exceptional to wear.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Material</h5>
                  <p className="text-sm font-medium">100% Premium Silk</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Fit</h5>
                  <p className="text-sm font-medium">Regular Fit</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Care</h5>
                  <p className="text-sm font-medium">Dry Clean Only</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Origin</h5>
                  <p className="text-sm font-medium">Handcrafted in Milan</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="bg-white p-10 rounded-3xl border border-gray-50 shadow-sm text-center">
               <div className="max-w-xl mx-auto py-20">
                 <Star className="w-12 h-12 text-accent mx-auto mb-6 opacity-20" />
                 <h3 className="text-2xl font-serif font-bold mb-4">No Reviews Yet</h3>
                 <p className="text-muted-foreground mb-8">Be the first to share your experience with this premium product.</p>
                 <Button className="rounded-full px-10">Write a Review</Button>
               </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.5em] text-accent mb-3">You May Also Like</h2>
              <h3 className="text-4xl font-serif font-bold tracking-tight">Complete Your Style</h3>
            </div>
            <Link to="/shop" className="text-sm font-bold uppercase tracking-widest border-b-2 border-accent pb-1 hover:text-accent transition-colors">See All Related</Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
