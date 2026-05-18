import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Filter, ChevronDown, LayoutGrid, List, Search as SearchIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const CATEGORIES = ["Men", "Women", "Accessories", "Footwear", "Kids"];
const BRANDS = ["Nike", "Adidas", "Gucci", "Prada", "Polo"];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const prodRef = collection(db, 'products');
        let q = query(prodRef);

        if (selectedCategories.length > 0) {
          q = query(prodRef, where('category', 'in', selectedCategories));
        }

        let snap;
        try {
          snap = await getDocs(q);
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'products');
          return;
        }
        let allProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // Client side filtering for price (Firestore in operator limitations)
        allProducts = allProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Sorting
        if (sortBy === 'price-low') allProducts.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-high') allProducts.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') allProducts.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));

        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching shop products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategories, priceRange, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="pt-28 pb-20 container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-72 space-y-10 shrink-0">
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </h3>
            
            <div className="space-y-8">
              {/* Category Filter */}
              <div>
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h4>
                <div className="space-y-3">
                  {CATEGORIES.map(cat => (
                    <div key={cat} className="flex items-center space-x-3 cursor-pointer group" onClick={() => toggleCategory(cat)}>
                      <Checkbox checked={selectedCategories.includes(cat)} className="rounded-md border-gray-300 data-[state=checked]:bg-accent data-[state=checked]:border-accent" />
                      <span className={`text-sm tracking-wide transition-colors ${selectedCategories.includes(cat) ? 'text-accent font-semibold' : 'text-gray-600 group-hover:text-black'}`}>{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider">Price Range</h4>
                <Slider 
                  defaultValue={[0, 1000]} 
                  max={2000} 
                  step={10} 
                  onValueChange={(val) => setPriceRange(val as number[])}
                  className="mb-4"
                />
                <div className="flex justify-between text-xs font-mono text-gray-500">
                  <span>৳{priceRange[0]}</span>
                  <span>৳{priceRange[1]}</span>
                </div>
              </div>

              {/* Brands */}
              <div>
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Brands</h4>
                <div className="space-y-3">
                  {BRANDS.map(brand => (
                    <div key={brand} className="flex items-center space-x-3 cursor-pointer group">
                      <Checkbox className="rounded-md border-gray-300" />
                      <span className="text-sm text-gray-600 group-hover:text-black transition-colors tracking-wide">{brand}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 bg-black rounded-3xl text-white relative overflow-hidden group cursor-pointer">
            <div className="relative z-10">
              <h4 className="text-xl font-serif font-bold mb-2">Join Our Club</h4>
              <p className="text-xs text-gray-400 mb-6">Get 20% off your first order when you sign up.</p>
              <Button size="sm" className="bg-accent text-white hover:bg-white hover:text-black rounded-full text-xs">Sign Up Now</Button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </div>
        </aside>

        {/* Product Listing */}
        <div className="flex-grow">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-3xl shadow-sm mb-8 gap-4 border border-gray-100">
            <p className="text-sm text-muted-foreground font-medium">
              Showing <span className="text-black font-bold">{products.length}</span> products
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-xl">
                <Button 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="rounded-lg w-8 h-8 h-8" 
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="rounded-lg w-8 h-8" 
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-secondary/50 border-none rounded-xl h-10 focus:ring-accent">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            <AnimatePresence>
              {loading ? (
                Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-secondary/30 aspect-[3/4] rounded-3xl" />
                ))
              ) : products.length > 0 ? (
                products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-secondary/10 rounded-3xl border border-dashed border-gray-200">
                  <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <h3 className="text-xl font-serif font-bold mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-8">Try adjusting your filters or search query.</p>
                  <Button variant="outline" className="rounded-full px-8" onClick={() => setSelectedCategories([])}>Clear All Filters</Button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
