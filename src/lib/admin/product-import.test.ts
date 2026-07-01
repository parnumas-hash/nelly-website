import { describe, expect, it } from "vitest";
import {
  applyProductImportGroups,
  parseImageUrls,
  type ProductImportGroup,
} from "@/lib/admin/product-import";
import { AdminProduct } from "@/types";

describe("parseImageUrls", () => {
  it("splits pipe-separated URLs and trims whitespace", () => {
    expect(
      parseImageUrls(" https://a.example/1.jpg | https://b.example/2.jpg ")
    ).toEqual(["https://a.example/1.jpg", "https://b.example/2.jpg"]);
  });

  it("returns an empty array for blank input", () => {
    expect(parseImageUrls("   ")).toEqual([]);
  });
});

describe("applyProductImportGroups", () => {
  const existing: AdminProduct[] = [
    {
      id: "prod-1",
      slug: "existing-product",
      name: "Existing Product",
      brand: "AIRBUGGY PET",
      brandId: "brand-1",
      categoryId: "accessories",
      category: "accessories",
      description: "Existing",
      longDescription: "Existing long",
      variants: [
        {
          id: "var-1",
          color: "Default",
          size: "One Size",
          sku: "SKU-001",
          barcode: "SKU-001",
          price: 100,
          stock: 5,
          imageIds: [],
          images: ["/images/placeholder.svg"],
          status: "available",
        },
      ],
      status: "published",
      featured: false,
      isNew: false,
      bestSeller: false,
      rating: 4.8,
      reviewCount: 0,
      tags: [],
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  const upsertGroup: ProductImportGroup = {
    groupKey: "existing",
    existingProductId: "prod-1",
    productData: {
      name: "Existing Product Updated",
      slug: "existing-product",
      brand: "AIRBUGGY PET",
      brandId: "brand-1",
      categoryId: "accessories",
      category: "accessories",
      description: "Updated description",
      longDescription: "Updated long description",
      status: "published",
      featured: true,
      isNew: false,
      bestSeller: false,
      tags: ["updated"],
    },
    variants: [
      {
        id: "var-1",
        color: "Default",
        size: "One Size",
        sku: "SKU-001",
        barcode: "SKU-001",
        price: 120,
        stock: 9,
        imageIds: ["media-1"],
        images: [],
        status: "available",
      },
    ],
  };

  it("updates an existing product and variant in upsert mode", () => {
    const result = applyProductImportGroups(existing, [upsertGroup], "upsert");

    expect(result.created).toBe(0);
    expect(result.updated).toBe(1);
    expect(result.nextProducts[0]?.name).toBe("Existing Product Updated");
    expect(result.nextProducts[0]?.variants[0]?.price).toBe(120);
    expect(result.nextProducts[0]?.variants[0]?.imageIds).toEqual(["media-1"]);
  });

  it("creates a new product in create mode", () => {
    const createGroup: ProductImportGroup = {
      ...upsertGroup,
      groupKey: "new-product",
      existingProductId: undefined,
      productData: {
        ...upsertGroup.productData,
        name: "Brand New Product",
        slug: "brand-new-product",
      },
      variants: [
        {
          ...upsertGroup.variants[0],
          id: "var-new",
          sku: "SKU-NEW",
          barcode: "SKU-NEW",
        },
      ],
    };

    const result = applyProductImportGroups(existing, [createGroup], "create");

    expect(result.created).toBe(1);
    expect(result.updated).toBe(0);
    expect(result.nextProducts).toHaveLength(2);
    expect(result.nextProducts[0]?.slug).toBe("brand-new-product");
  });
});
