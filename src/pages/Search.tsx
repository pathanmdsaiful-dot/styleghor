import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

export default function Search() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        const prodRef = collection(db, 'products');
        const snap = await getDocs(prodRef);
        const allProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        // Simple client side search for demo purposes
        // In production, use Algolia or similar
        const filtered = allProducts.filter(p => 
          p.name.toLowerCase().includes(queryParam.toLowerCase()) ||
          p.description.toLowerCase().includes(queryParam.toLowerCase()) ||
          p.category.toLowerCase().includes(queryParam.toLowerCase())
        );
        
        setProducts(filtered);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (queryParam) {
      performSearch();
    } else {
      setLoading(false);
    }
  }, [queryParam]);

  return (
    <div className="pt-32 pb-20 container mx-auto px-4">
      <div className="mb-12">
        <h1 className="text-3xl font-serif font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground">Showing results for "<span className="text-primary font-bold">{queryParam}</span>"</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-32 bg-secondary/10 rounded-[3rem] border border-dashed border-gray-200">
          <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h3 className="text-2xl font-serif font-bold mb-3">No Results Found</h3>
          <p className="text-muted-foreground mb-8">Try another keyword or browse our categories.</p>
        </div>
      )}
    </div>
  );
}
