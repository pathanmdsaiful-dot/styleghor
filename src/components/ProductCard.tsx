import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCartStore } from '../store/cartStore';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop',
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const discountBadge = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="premium-card p-4 relative group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square rounded-[24px] overflow-hidden bg-gray-50 mb-4">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          <div className="absolute top-4 right-4 z-10">
            {discountBadge && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                -{discountBadge}% OFF
              </span>
            )}
          </div>
          
          {product.isNewArrival && !discountBadge && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">New Arrival</span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold truncate group-hover:text-accent transition-colors leading-tight">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
             <div className="flex text-yellow-400 text-[10px]">
               {Array.from({ length: 5 }).map((_, i) => (
                 <span key={i}>★</span>
               ))}
             </div>
             <span className="text-gray-400 text-[10px]">({product.reviewsCount || 0} Reviews)</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">
                ৳{(product.discountPrice || product.price).toFixed(2)}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  ৳{product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            <button 
              className="p-2.5 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:scale-110 transition-transform active:scale-95"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
