import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Star, ShoppingCart, Heart, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, products } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'description' | 'ingredients' | 'reviews'>('description');

  const product = products.find(p => p.id === parseInt(id || '0'));

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-black text-white px-6 py-2 rounded-full"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`, {
      description: `Quantity: ${quantity}`
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-[#FFE4E9] text-sm rounded-full mb-4">
                {product.category}
              </span>
              <h1 className="font-['Poppins'] text-4xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-[#FFC0CB] text-[#FFC0CB]' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({product.rating})</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{product.reviews.length} reviews</span>
              </div>

              <p className="text-3xl font-bold mb-6">${product.price.toFixed(2)}</p>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Suitable for:</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.skinTypes.map(type => (
                    <span key={type} className="px-3 py-1 bg-[#FFE4E9] rounded-full text-sm capitalize">
                      {type} skin
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-6 py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600">In Stock</span>
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button className="p-3 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-3 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-[#FFC0CB]" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-[#FFC0CB]" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-[#FFC0CB]" />
                  <span>100% natural ingredients</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex gap-8 border-b border-gray-200 mb-6">
            <button
              onClick={() => setSelectedTab('description')}
              className={`pb-4 font-semibold transition-colors ${
                selectedTab === 'description'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setSelectedTab('ingredients')}
              className={`pb-4 font-semibold transition-colors ${
                selectedTab === 'ingredients'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setSelectedTab('reviews')}
              className={`pb-4 font-semibold transition-colors ${
                selectedTab === 'reviews'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Reviews ({product.reviews.length})
            </button>
          </div>

          {selectedTab === 'description' && (
            <div>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {selectedTab === 'ingredients' && (
            <div>
              <h3 className="font-semibold mb-4">Key Ingredients:</h3>
              <div className="grid grid-cols-2 gap-4">
                {product.ingredients.map(ingredient => (
                  <div key={ingredient} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#FFC0CB] rounded-full" />
                    <span>{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'reviews' && (
            <div className="space-y-6">
              {product.reviews.length > 0 ? (
                product.reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#FFE4E9] rounded-full flex items-center justify-center font-semibold">
                        {review.user[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{review.user}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < review.rating ? 'fill-[#FFC0CB] text-[#FFC0CB]' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
