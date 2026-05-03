import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { Star, ShoppingCart, Heart, Share2, Check, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart, products, user, orders, addProductReview, toggleWishlist, isInWishlist } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'description' | 'ingredients' | 'reviews'>('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [highlightMine, setHighlightMine] = useState(false);

  const product = products.find(p => p.id === parseInt(id || '0'));
  const availableStock = Number(product?.stock ?? 0);
  const hasPurchased = Boolean(
    user &&
      orders.some((order) => order.items.some((item) => Number(item.product?.id) === Number(product?.id)))
  );

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'reviews' || tab === 'ingredients' || tab === 'description') {
      setSelectedTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const shouldFocusMine = searchParams.get('focus') === 'mine';
    if (!shouldFocusMine || selectedTab !== 'reviews' || !user) return;

    const mineKey = user.name.trim().toLowerCase();
    const target = document.querySelector<HTMLElement>(`[data-review-user='${mineKey}']`);
    if (!target) return;

    setHighlightMine(true);
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const t = window.setTimeout(() => setHighlightMine(false), 2000);
    return () => window.clearTimeout(t);
  }, [searchParams, selectedTab, user]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-black text-white px-6 py-2 rounded-full"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    try {
      if (availableStock <= 0) {
        toast.error('Sản phẩm đã hết hàng');
        return;
      }
      const safeQuantity = Math.max(1, Math.min(quantity, availableStock));
      if (safeQuantity !== quantity) setQuantity(safeQuantity);
      addToCart(product, safeQuantity);
      toast.success(`${product.name} đã được thêm vào giỏ hàng!`, {
        description: `Số lượng: ${safeQuantity}`
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể thêm vào giỏ hàng';
      toast.error(message);
    }
  };

  const handleBuyNow = () => {
    try {
      if (availableStock <= 0) {
        toast.error('Sản phẩm đã hết hàng');
        return;
      }
      const safeQuantity = Math.max(1, Math.min(quantity, availableStock));
      if (safeQuantity !== quantity) setQuantity(safeQuantity);
      addToCart(product, safeQuantity);
      toast.success('Đã thêm vào giỏ hàng', {
        description: `Chuyển tới thanh toán · SL: ${safeQuantity}`,
      });
      void navigate('/checkout');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể mua ngay';
      toast.error(message);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để viết đánh giá');
      navigate('/login?redirect=' + encodeURIComponent(`/products/${product.id}`));
      return;
    }
    if (!hasPurchased) {
      toast.error('Bạn cần mua sản phẩm này trước khi viết đánh giá');
      return;
    }
    const comment = reviewForm.comment.trim();
    if (comment.length < 5) {
      toast.error('Nhận xét phải có ít nhất 5 ký tự');
      return;
    }
    try {
      setSubmittingReview(true);
      await addProductReview(product.id, { rating: reviewForm.rating, comment });
      toast.success('Đánh giá đã được gửi');
      setReviewForm({ rating: 5, comment: '' });
      setSelectedTab('reviews');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    const nextWishlisted = !isInWishlist(product.id);
    toast.success(nextWishlisted ? 'Đã thêm vào wishlist' : 'Đã xóa khỏi wishlist');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `${product.name} - $${product.price.toFixed(2)}`,
          url,
        });
        toast.success('Đã mở chia sẻ');
        return;
      }
    } catch {
      // user cancelled or share failed -> fallback to copy
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép liên kết sản phẩm');
    } catch {
      toast.error('Không thể sao chép liên kết. Vui lòng thử lại.');
    }
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
                <span className="text-gray-600">{product.reviews.length} đánh giá</span>
              </div>

              <p className="text-3xl font-bold mb-6">${product.price.toFixed(2)}</p>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Phù hợp với:</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.skinTypes.map(type => (
                    <span key={type} className="px-3 py-1 bg-[#FFE4E9] rounded-full text-sm capitalize">
                      Da {type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-6 py-2">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.min(Math.max(1, availableStock || 1), prev + 1))}
                    disabled={availableStock > 0 ? quantity >= availableStock : true}
                    className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600">
                  {availableStock > 0 ? `Còn ${availableStock} sản phẩm` : 'Hết hàng'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={availableStock <= 0}
                  className="flex-1 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {availableStock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={availableStock <= 0}
                  className="flex-1 bg-[#FFC0CB] text-black py-3 rounded-full hover:bg-[#ffb3c1] transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  <Zap className="w-5 h-5" />
                  Mua ngay
                </button>
              </div>
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="p-3 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={isInWishlist(product.id) ? 'Xóa khỏi wishlist' : 'Thêm vào wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-[#FFC0CB] text-[#FFC0CB]' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="p-3 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Chia sẻ sản phẩm"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-[#FFC0CB]" />
                  <span>Miễn phí vận chuyển cho đơn trên $50</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-[#FFC0CB]" />
                  <span>Cam kết hoàn tiền trong 30 ngày</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-[#FFC0CB]" />
                  <span>100% thành phần tự nhiên</span>
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
              Mô tả
            </button>
            <button
              onClick={() => setSelectedTab('ingredients')}
              className={`pb-4 font-semibold transition-colors ${
                selectedTab === 'ingredients'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Thành phần
            </button>
            <button
              onClick={() => setSelectedTab('reviews')}
              className={`pb-4 font-semibold transition-colors ${
                selectedTab === 'reviews'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Đánh giá ({product.reviews.length})
            </button>
          </div>

          {selectedTab === 'description' && (
            <div>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {selectedTab === 'ingredients' && (
            <div>
              <h3 className="font-semibold mb-4">Thành phần chính:</h3>
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
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold mb-3">Viết đánh giá</h3>
                {!hasPurchased && (
                  <div className="mb-4 rounded-lg bg-[#FFF7F9] border border-[#FFE4EA] px-4 py-3 text-sm text-gray-700">
                    Bạn cần mua sản phẩm này trước khi có thể viết đánh giá.
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Chấm sao</label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setReviewForm((prev) => ({ ...prev, rating: value }))}
                            disabled={!hasPurchased}
                            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                            aria-label={`${value} star${value > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`w-6 h-6 ${
                                value <= reviewForm.rating ? 'fill-[#FFC0CB] text-[#FFC0CB]' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{reviewForm.rating}/5</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Nhận xét</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      rows={3}
                      disabled={!hasPurchased}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Chia sẻ trải nghiệm của bạn..."
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !hasPurchased}
                    className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </div>
              {product.reviews.length > 0 ? (
                product.reviews.map(review => (
                  <div
                    key={review.id}
                    data-review-user={review.user.trim().toLowerCase()}
                    className={`border-b border-gray-200 pb-6 last:border-0 rounded-xl px-3 -mx-3 transition-colors ${
                      highlightMine && user && review.user.trim().toLowerCase() === user.name.trim().toLowerCase()
                        ? 'bg-[#FFE4E9]'
                        : ''
                    }`}
                  >
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
                <p className="text-gray-600">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
