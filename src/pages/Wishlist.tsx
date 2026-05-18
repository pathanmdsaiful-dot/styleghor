import { ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Wishlist() {
  return (
    <div className="pt-32 pb-20 container mx-auto px-4 text-center">
      <div className="max-w-md mx-auto py-20 bg-secondary/10 rounded-[3rem] border border-dashed border-gray-200">
        <Heart className="w-20 h-20 text-accent/20 mx-auto mb-8" />
        <h2 className="text-3xl font-serif font-bold mb-4 tracking-tight">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-12 px-10">Save your favorite premium items here to keep track of what you love.</p>
        <Button asChild size="lg" className="rounded-full px-12 h-14 bg-primary text-white hover:bg-accent border-none text-lg gap-2">
          <Link to="/shop">Explore Collection <ArrowRight className="w-5 h-5" /></Link>
        </Button>
      </div>
    </div>
  );
}
