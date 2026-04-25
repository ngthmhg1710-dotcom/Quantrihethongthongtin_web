import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Star, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ProductListing() {
  const { products } = useApp();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedSkinType, setSelectedSkinType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const skinTypes = ['all', 'dry', 'oily', 'combination', 'normal', 'sensitive'];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSkinType = selectedSkinType === 'all' || product.skinTypes.includes(selectedSkinType);
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSkinType && matchesPrice && matchesSearch;
    });
  }, [selectedCategory, selectedSkinType, priceRange, searchQuery]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-['Poppins'] text-4xl font-bold mb-4">Shop All Products</h1>
          <p className="text-gray-600">Discover our complete collection of premium skincare</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="w-5 h-5" />
                <h3 className="font-['Poppins'] font-semibold">Filters</h3>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="w-4 h-4 text-[#FFC0CB] focus:ring-[#FFC0CB]"
                      />
                      <span className="text-sm capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Skin Type</h4>
                <div className="space-y-2">
                  {skinTypes.map(skinType => (
                    <label key={skinType} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="skinType"
                        checked={selectedSkinType === skinType}
                        onChange={() => setSelectedSkinType(skinType)}
                        className="w-4 h-4 text-[#FFC0CB] focus:ring-[#FFC0CB]"
                      />
                      <span className="text-sm capitalize">{skinType}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full accent-[#FFC0CB]"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange.min}</span>
                    <span>${priceRange.max}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSkinType('all');
                  setPriceRange({ min: 0, max: 100 });
                  setSearchQuery('');
                }}
                className="w-full mt-6 py-2 text-sm text-[#FFC0CB] hover:underline"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">{filteredProducts.length} products found</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-[#FFC0CB] text-[#FFC0CB]' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">({product.rating})</span>
                    </div>
                    <h3 className="font-['Poppins'] font-semibold mb-1 text-sm">{product.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{product.category}</p>
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      {product.skinTypes.slice(0, 2).map(type => (
                        <span key={type} className="px-2 py-1 bg-[#FFE4E9] text-xs rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                      <span className="text-xs text-[#FFC0CB] group-hover:underline">View</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No products found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSkinType('all');
                    setPriceRange({ min: 0, max: 100 });
                    setSearchQuery('');
                  }}
                  className="mt-4 text-[#FFC0CB] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
