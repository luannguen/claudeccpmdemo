import React from "react";

// Hooks - from module
import {
  usePreOrders,
  useProductLots,
  useProducts,
  useActiveLots,
  useLotFilters
} from "@/components/features/preorder";

// Components
import PreOrderHero from "@/components/preorder/PreOrderHero";
import PreOrderFilters from "@/components/preorder/PreOrderFilters";
import PreOrderLotsGrid from "@/components/preorder/PreOrderLotsGrid";
import PreOrderLoadingState from "@/components/preorder/PreOrderLoadingState";
import PreOrderEmptyState from "@/components/preorder/PreOrderEmptyState";

export default function PreOrderLots() {
  const { categoryFilter, setCategoryFilter } = useLotFilters();

  // Data hooks - fetch all 3 entities for complete fallback chain
  const { data: preOrders = [], isLoading: loadingPreOrders } = usePreOrders();
  const { data: lots = [], isLoading: loadingLots } = useProductLots();
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const activeLots = useActiveLots(lots, preOrders, products);
  

  
  const isLoading = loadingPreOrders || loadingLots || loadingProducts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white">
      <PreOrderHero lotsCount={activeLots.length} />

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <PreOrderFilters 
          categoryFilter={categoryFilter} 
          setCategoryFilter={setCategoryFilter} 
        />

        {isLoading ? (
          <PreOrderLoadingState />
        ) : activeLots.length === 0 ? (
          <PreOrderEmptyState />
        ) : (
          <PreOrderLotsGrid lots={activeLots} />
        )}
      </section>
    </div>
  );
}