import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Hooks
import { 
  useCategories, 
  useProducts, 
  useCurrentUser, 
  useFilteredProducts,
  PRICE_RANGES
} from "@/components/hooks/useProducts";

// Components
import ServicesHeader from "@/components/services/ServicesHeader";
import StickySearchBar from "@/components/services/StickySearchBar";
import ServicesProductGrid from "@/components/services/ServicesProductGrid";
import ServicesCallToAction from "@/components/services/ServicesCallToAction";

// Modals & Widgets
import ProductReviewModal from "@/components/ProductReviewModal";
import QuickViewModalEnhanced from "@/components/modals/QuickViewModalEnhanced";
import UndoToast from "@/components/community/UndoToast";
import GestureOnboarding from "@/components/community/GestureOnboarding";


export default function Services() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [activeFilter, setActiveFilter] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const [reviewModalProduct, setReviewModalProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [undoState, setUndoState] = useState({ visible: false, message: '', action: null });

  // Data hooks
  const { categories } = useCategories();
  const { data: products, isLoading, isError } = useProducts();
  const { data: currentUser } = useCurrentUser();
  
  // Filtered products
  const filteredProducts = useFilteredProducts(products, activeFilter, searchTerm, sortBy, priceRange);
  
  // Displayed products (paginated)
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  const hasMore = displayCount < filteredProducts.length;

  // URL params handling
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categories?.some(cat => cat.key === categoryFromUrl)) {
      setActiveFilter(categoryFromUrl);
    }
  }, [searchParams, categories]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(12);
  }, [activeFilter, searchTerm, sortBy, priceRange]);

  // Quick View Event Listener
  useEffect(() => {
    const handleQuickView = (e) => {
      setQuickViewProduct(e.detail.product);
    };

    window.addEventListener('quick-view-product', handleQuickView);
    return () => window.removeEventListener('quick-view-product', handleQuickView);
  }, []);

  // ✅ Bottom Nav Events - toggle-filters
  useEffect(() => {
    const handleToggleFilters = () => {
      setShowFilters(prev => !prev);
    };

    window.addEventListener('toggle-filters', handleToggleFilters);
    return () => window.removeEventListener('toggle-filters', handleToggleFilters);
  }, []);

  // Handlers
  const handleEnterFlipMode = () => {
    navigate(createPageUrl('FlipMode'));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setPriceRange('all');
  };

  return (
    <div className="pt-24 sm:pt-28 pb-4 bg-gradient-to-b from-[#F5F9F3] to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        <ServicesHeader />

        <StickySearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filteredCount={filteredProducts.length}
          displayedCount={displayedProducts.length}
          onEnterFlipMode={handleEnterFlipMode}
          categories={categories}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          priceRanges={PRICE_RANGES}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />

        <ServicesProductGrid
          viewMode={viewMode}
          displayedProducts={displayedProducts}
          filteredProducts={filteredProducts}
          isLoading={isLoading}
          isError={isError}
          hasMore={hasMore}
          displayCount={displayCount}
          setDisplayCount={setDisplayCount}
          searchTerm={searchTerm}
          activeFilter={activeFilter}
          onClearFilters={handleClearFilters}
        />

        <ServicesCallToAction />
      </div>
      
      {/* Modals */}
      {quickViewProduct && (
        <QuickViewModalEnhanced
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          product={quickViewProduct}
        />
      )}
      
      {reviewModalProduct && (
        <ProductReviewModal
          isOpen={true}
          onClose={() => setReviewModalProduct(null)}
          product={reviewModalProduct}
          currentUser={currentUser}
        />
      )}

      {/* Widgets */}
      <UndoToast
        isVisible={undoState.visible}
        message={undoState.message}
        onUndo={undoState.action}
        onDismiss={() => setUndoState(prev => ({ ...prev, visible: false }))}
        duration={5000}
      />

      <GestureOnboarding />


    </div>
  );
}