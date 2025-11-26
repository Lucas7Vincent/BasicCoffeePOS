'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product, Category } from '@/types/pos';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onProductAdd: (product: Product) => void;
}

export function ProductGrid({ products, categories, onProductAdd }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    const matchesSearch = product?.productName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search và Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Tất cả
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.categoryName}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="space-y-2">
                {/* Product Image */}
                {product.description && product.description.startsWith('http') ? (
                  <div className="w-full h-32 overflow-hidden rounded-t-lg">
                    <img 
                      src={product.description} 
                      alt={product.productName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg hidden items-center justify-center">
                      <span className="text-gray-400 text-sm">Không có ảnh</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg flex items-center justify-center">
                    <span className="text-primary/60 text-sm font-medium">{product.productName.charAt(0)}</span>
                  </div>
                )}
                
                {/* Product Info */}
                <div className="p-4 space-y-2">
                  <h3 className="font-medium line-clamp-2">{product.productName}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">
                      {formatCurrency(product.unitPrice)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => onProductAdd(product)}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Thêm
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Không tìm thấy sản phẩm nào
        </div>
      )}
    </div>
  );
}