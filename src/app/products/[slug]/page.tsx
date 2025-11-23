"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Star, Shield, Truck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  SanityProduct,
  ProductListItem,
  ProductVariant,
} from "@/lib/sanity.types";
import { getProductBySlug, getRelatedProducts } from "@/lib/sanity.data";
import { urlFor } from "@/lib/sanity";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<SanityProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductListItem[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductData();
  }, [params?.slug]);

  const fetchProductData = async () => {
    if (params?.slug) {
      const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

      try {
        const productData = await getProductBySlug(slug);
        if (productData) {
          setProduct(productData);
          // Set the first available variant as default
          const firstVariant = productData.variants?.[0];
          setSelectedVariant(firstVariant || null);

          // Get related products
          const related = await getRelatedProducts(
            productData.category.slug.current,
            slug
          );
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Product Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The product you're looking for doesn't exist.
            </p>
            <Link href="/products">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/products" className="hover:text-primary">
            Products
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <Link
                href={`/products?category=${product.category.slug.current}`}
                className="hover:text-primary"
              >
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              {product.images?.[0] ? (
                <Image
                  src={`/assets/${product.slug.current}.jpg`}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/assets/placeholder-product.jpg";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🥈</div>
                    <span className="text-gray-500">Silver Product</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                {product.category && (
                  <Badge variant="secondary">{product.category.name}</Badge>
                )}
                {product.featured && (
                  <Badge variant="default" className="bg-primary">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                {product.shortDescription}
              </p>
            </div>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Available Variants
                </h3>
                <Select
                  value={selectedVariant?._key || ""}
                  onValueChange={(value) => {
                    const variant = product.variants.find(
                      (v) => v._key === value
                    );
                    setSelectedVariant(variant || null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.map((variant) => (
                      <SelectItem key={variant._key} value={variant._key}>
                        {variant.weightGrams}g
                        {variant.heightInches && ` - ${variant.heightInches}"`}
                        {variant.diameterInches &&
                          ` × ${variant.diameterInches}"`}
                        {variant.status === "out_of_stock" && " (Out of Stock)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Selected Variant Details */}
            {selectedVariant && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Weight</p>
                  <p className="text-lg font-semibold">
                    {selectedVariant.weightGrams}g
                  </p>
                </div>

                {(selectedVariant.heightInches ||
                  selectedVariant.diameterInches ||
                  selectedVariant.lengthInches) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">
                      Dimensions
                    </p>
                    <p className="text-lg font-semibold">
                      {selectedVariant.heightInches &&
                        `H: ${selectedVariant.heightInches}"`}
                      {selectedVariant.diameterInches &&
                        ` D: ${selectedVariant.diameterInches}"`}
                      {selectedVariant.lengthInches &&
                        ` L: ${selectedVariant.lengthInches}"`}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg font-semibold">
                    <Badge
                      variant={
                        selectedVariant.status === "available"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        selectedVariant.status === "available"
                          ? "bg-green-500"
                          : ""
                      }
                    >
                      {selectedVariant.status === "available"
                        ? "Available"
                        : selectedVariant.status === "out_of_stock"
                          ? "Out of Stock"
                          : "Discontinued"}
                    </Badge>
                  </p>
                </div>

                {selectedVariant.sku && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">SKU</p>
                    <p className="text-lg font-semibold">
                      {selectedVariant.sku}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Materials */}
            {product.materials && product.materials.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material) => (
                    <Badge
                      key={material._id}
                      variant="outline"
                      className="text-sm"
                    >
                      {material.name}
                      {material.purity && ` (${material.purity}%)`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Collections */}
            {product.collections && product.collections.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Collections</h3>
                <div className="flex flex-wrap gap-2">
                  {product.collections.map((collection) => (
                    <Badge
                      key={collection._id}
                      variant="outline"
                      className="text-sm"
                    >
                      {collection.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="pt-6">
              <Button size="lg" className="w-full mb-4">
                Inquire About This Piece
              </Button>
              <p className="text-sm text-gray-600 text-center">
                Contact us for availability and custom requests
              </p>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Product Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle>Product Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct._id}
                  className="group hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                      {relatedProduct.images?.[0] ? (
                        <Image
                          src={urlFor(relatedProduct.images[0])
                            .width(300)
                            .height(300)
                            .url()}
                          alt={relatedProduct.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl mb-1">🥈</div>
                            <span className="text-gray-500 text-xs">
                              Silver Product
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </CardTitle>
                    <CardDescription className="text-sm mb-4 line-clamp-2">
                      {relatedProduct.shortDescription}
                    </CardDescription>
                    <Link href={`/products/${relatedProduct.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
