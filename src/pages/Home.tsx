import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { ChevronRight, ArrowRight, Sparkles, TrendingUp, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';


const CATEGORIES = [
  { name: 'Men', image: 'https://images.unsplash.com/photo-1488161628813-24479bdca245?q=80&w=1964&auto=format&fit=crop' },
  { name: 'Women', image: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=1976&auto=format&fit=crop' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop' },
  { name: 'Footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop' },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const prodRef = collection(db, 'products');
        
        // Featured
        const fQuery = query(prodRef, where('isFeatured', '==', true), limit(8));
        let fSnap;
        try {
          fSnap = await getDocs(fQuery);
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'products (featured)');
          return;
        }
        setFeaturedProducts(fSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        // Flash Sale
        const fsQuery = query(prodRef, where('isFlashSale', '==', true), limit(4));
        let fsSnap;
        try {
          fsSnap = await getDocs(fsQuery);
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'products (flash sale)');
          return;
        }
        setFlashSaleProducts(fsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="px-4 pt-28 pb-12">
        <div className="container mx-auto">
          <div className="bg-[#111111] rounded-[2.5rem] min-h-[400px] md:min-h-[500px] relative overflow-hidden flex items-center px-8 md:px-20 py-20">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="z-10 max-w-2xl"
            >
              <span className="bg-accent text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-6 inline-block shadow-lg shadow-accent/20">New Arrival</span>
              <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tighter mb-8">
                Luxe Edition <br /> <span className="text-gray-400">Collection 2024</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-md font-medium leading-relaxed">
                Experience the intersection of high fashion and technical precision.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-full px-10 h-14 bg-white text-black hover:bg-accent hover:text-white border-none text-lg font-bold shadow-xl transition-all hover:scale-105">
                  <Link to="/shop">Shop the Drop</Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-10 h-14 border-white/20 bg-transparent text-white hover:bg-white/10 text-lg font-bold">
                  View Lookbook
                </Button>
              </div>
            </motion.div>
            
            {/* Abstract Decorative Elements */}
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-accent/20 to-transparent pointer-events-none" />
            <div className="absolute -right-20 -bottom-20 w-[500px] h-[500px] bg-accent rounded-full blur-[120px] opacity-20 pointer-events-none" />
            
            <div className="hidden lg:block absolute right-20 top-1/2 -translate-y-1/2 w-64 h-96 bg-gray-900/50 rounded-3xl rotate-6 border border-white/10 backdrop-blur-3xl overflow-hidden shadow-2xl">
              <div className="w-full h-full flex flex-col items-center justify-center p-8 opacity-20">
                <div className="text-8xl font-black text-white/50 tracking-tighter select-none">SG</div>
                <div className="text-xs font-bold uppercase tracking-[0.5em] text-white mt-4">ELITE</div>
              </div>
              <div className="absolute top-0 right-0 p-4">
                 <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Bar */}
      <section className="px-4 py-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-6 py-2.5 bg-white text-black border border-gray-200 rounded-full text-xs font-bold shadow-sm hover:border-accent hover:text-accent transition-all">All Products</button>
            <button className="px-6 py-2.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold hover:bg-gray-200 transition-all">Trending</button>
            <button className="px-6 py-2.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold hover:bg-gray-200 transition-all">New Release</button>
            <button className="px-6 py-2.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold hover:bg-gray-200 transition-all">Luxury</button>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort by:</span>
             <span className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:text-accent">Best Match <ArrowRight className="rotate-90 w-3 h-3 ml-1" /></span>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-accent mb-3">Trending Now</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Shop by Category</h3>
          </div>
          <Button variant="link" className="text-accent gap-2 p-0 text-lg h-auto">View All Collections <ArrowRight className="w-5 h-5" /></Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer"
            >
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10">
                <h4 className="text-white text-3xl font-serif font-bold mb-2">{cat.name}</h4>
                <div className="mt-6 flex items-center text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore Now <ChevronRight className="ml-1 w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      <section className="py-24 bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <div className="bg-red-500 p-3 rounded-2xl animate-pulse">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-4xl font-serif font-bold tracking-tight">Flash Sale</h3>
                <p className="text-gray-400 text-sm tracking-widest uppercase mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full inline-block" /> Ending in 04:23:15
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-white/20 hover:bg-white hover:text-black rounded-full px-8 text-white bg-transparent">View All</Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {flashSaleProducts.length > 0 ? (
              flashSaleProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              // Empty state illustration/placeholders could go here
              <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                <Zap className="w-12 h-12 text-accent mx-auto mb-4 opacity-50" />
                <p className="text-gray-500">No active flash sales right now. Come back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-accent text-sm font-bold uppercase tracking-[0.5em] mb-4">Curated Perfection</h2>
          <h3 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6">Featured Styles</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">Discover the pieces that define the current season. Selected for their quality, design, and timeless appeal.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {featuredProducts.length > 0 ? (
            featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
          ) : (
            // Mock products if DB is empty
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-secondary aspect-[3/4] rounded-3xl mb-4" />
                <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                <div className="h-4 bg-secondary rounded w-1/2" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* AI Recommendation Banner */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-accent rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <Sparkles className="absolute top-10 left-10 w-20 h-20" />
              <Sparkles className="absolute bottom-20 right-20 w-32 h-32" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 inline-block">Powered by Gemini AI</span>
              <h3 className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-tight">Can't decide? Let our AI Stylist help you.</h3>
              <p className="text-lg md:text-xl text-gray-300 mb-12">Our smart recommendation engine analyzes your preferences to find the perfect fit for your unique style.</p>
              <Button size="lg" className="rounded-full px-12 h-14 bg-white text-black hover:bg-accent hover:text-white border-none text-lg gap-2">
                Get Personalized Picks <TrendingUp className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
