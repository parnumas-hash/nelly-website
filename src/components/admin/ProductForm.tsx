"use client";



import { useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import Input from "@/components/ui/Input";

import Button from "@/components/ui/Button";

import { useCatalog } from "@/context/CatalogContext";

import {

  AdminProduct,

  ProductFormData,

  ProductPetType,

  ProductStatus,

} from "@/types";

import {

  PRODUCT_PET_TYPE_LABELS,

  getProductFormCategoryOptions,

  resolveProductFormCategory,

  getBrandById,

} from "@/lib/brand-categories";

import { slugify } from "@/lib/utils";



interface ProductFormProps {

  initial?: AdminProduct;

  mode: "create" | "edit";

}



const emptyForm: ProductFormData = {

  name: "",

  slug: "",

  brand: "",

  brandId: "",

  petType: "",

  categoryId: "",

  subCategoryName: "",

  category: "accessories",

  description: "",

  longDescription: "",

  status: "draft",

  featured: false,

  isNew: false,

  bestSeller: false,

  tags: [],

};



function toFormData(product: AdminProduct): ProductFormData {

  return {

    name: product.name,

    slug: product.slug,

    brand: product.brand,

    brandId: product.brandId,

    petType: product.petType ?? "",

    categoryId: product.categoryId,

    subCategoryName: product.subCategoryName ?? "",

    category: product.category,

    description: product.description,

    longDescription: product.longDescription,

    status: product.status,

    featured: product.featured,

    isNew: product.isNew,

    bestSeller: product.bestSeller,

    tags: product.tags,

  };

}



export default function ProductForm({ initial, mode }: ProductFormProps) {

  const router = useRouter();

  const { addProduct, updateProduct, brands, categories } = useCatalog();

  const [form, setForm] = useState<ProductFormData>(

    initial ? toFormData(initial) : emptyForm

  );

  const [saving, setSaving] = useState(false);

  const [formError, setFormError] = useState("");



  const activeBrands = brands.filter((brand) => brand.active);

  const selectedBrand = getBrandById(activeBrands, form.brandId);

  const availableCategories = getProductFormCategoryOptions(

    categories,

    form.petType

  );



  const update = <K extends keyof ProductFormData>(

    key: K,

    value: ProductFormData[K]

  ) => setForm((prev) => ({ ...prev, [key]: value }));



  const handleBrandChange = (brandId: string) => {

    const brand = getBrandById(activeBrands, brandId);

    setForm((prev) => ({

      ...prev,

      brandId,

      brand: brand?.name ?? "",

      categoryId: "",

      category: "accessories",

    }));

  };



  const handlePetTypeChange = (petType: ProductPetType | "") => {

    setForm((prev) => ({

      ...prev,

      petType,

      categoryId: "",

      category: "accessories",

    }));

  };



  const handleCategoryChange = (categoryId: string) => {

    const category = resolveProductFormCategory(categories, categoryId);

    update("categoryId", categoryId);

    update("category", category?.slug ?? "accessories");

  };



  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    setFormError("");



    if (!form.brandId) {

      setFormError("Please select a brand.");

      return;

    }



    if (!form.categoryId) {

      setFormError("Please select a category.");

      return;

    }



    if (availableCategories.length === 0) {

      setFormError(

        categories.length === 0

          ? "Add categories under Admin → Categories."

          : "No categories match the selected pet type. Change pet type or add categories."

      );

      return;

    }



    setSaving(true);

    if (mode === "create") {

      const product = addProduct(form);

      router.push(`/admin/products/${product.id}/edit`);

    } else if (initial) {

      updateProduct(initial.id, form);

      router.push("/admin/products");

    }

    setSaving(false);

  };



  return (

    <form onSubmit={handleSubmit} className="space-y-8">

      <div className="grid gap-6 lg:grid-cols-2">

        <Input

          id="name"

          label="Product Name"

          value={form.name}

          onChange={(e) => update("name", e.target.value)}

          required

        />



        <div>

          <div className="mb-2 flex items-end justify-between gap-2">

            <label htmlFor="slug" className="block text-sm font-medium">

              URL Slug

            </label>

            <button

              type="button"

              onClick={() =>

                update("slug", slugify(form.name) || form.slug)

              }

              className="text-xs text-primary hover:underline"

            >

              Generate from name

            </button>

          </div>

          <Input

            id="slug"

            value={form.slug}

            onChange={(e) => update("slug", slugify(e.target.value))}

            placeholder="brixton-carry-backpack"

          />

          {form.slug && (

            <p className="mt-1 text-xs text-neutral-500">

              Store URL: /product/{form.slug}

            </p>

          )}

        </div>



        <div>

          <label className="mb-2 block text-sm font-medium">Brand</label>

          <select

            value={form.brandId}

            onChange={(e) => handleBrandChange(e.target.value)}

            required

            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"

          >

            <option value="">Select brand</option>

            {activeBrands.map((brand) => (

              <option key={brand.id} value={brand.id}>

                {brand.displayName}

              </option>

            ))}

          </select>

        </div>



        <div>

          <label className="mb-2 block text-sm font-medium">

            Pet Type <span className="text-neutral-400">(optional)</span>

          </label>

          <select

            value={form.petType ?? ""}

            onChange={(e) =>

              handlePetTypeChange(e.target.value as ProductPetType | "")

            }

            disabled={!form.brandId}

            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950"

          >

            <option value="">Not specified</option>

            {(Object.keys(PRODUCT_PET_TYPE_LABELS) as ProductPetType[]).map(

              (petType) => (

                <option key={petType} value={petType}>

                  {PRODUCT_PET_TYPE_LABELS[petType]}

                </option>

              )

            )}

          </select>

        </div>



        <div>

          <label className="mb-2 block text-sm font-medium">

            Category

          </label>

          <select

            value={form.categoryId}

            onChange={(e) => handleCategoryChange(e.target.value)}

            disabled={!form.brandId || availableCategories.length === 0}

            required

            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950"

          >

            <option value="">

              {availableCategories.length === 0

                ? "No categories available"

                : "Select category"}

            </option>

            {availableCategories.map((category) => (

              <option key={category.id} value={category.id}>

                {category.name}

              </option>

            ))}

          </select>

          <p className="mt-1.5 text-xs text-neutral-500">
            {categories.length === 0 ? (
              <>
                No categories yet.{" "}
                <Link
                  href="/admin/categories"
                  className="font-medium text-primary hover:underline"
                >
                  Add categories
                </Link>
              </>
            ) : (
              <Link
                href="/admin/categories"
                className="font-medium text-primary hover:underline"
              >
                Manage categories
              </Link>
            )}
          </p>

        </div>



        <Input

          id="subCategoryName"

          label="Subcategory Name"

          value={form.subCategoryName}

          onChange={(e) => update("subCategoryName", e.target.value)}

          placeholder="Optional finer grouping within the category"

        />



        <div>

          <label className="mb-2 block text-sm font-medium">Status</label>

          <select

            value={form.status}

            onChange={(e) => update("status", e.target.value as ProductStatus)}

            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"

          >

            <option value="draft">Draft</option>

            <option value="published">Published</option>

          </select>

        </div>

      </div>



      <div>

        <label className="mb-2 block text-sm font-medium">Description</label>

        <textarea

          value={form.description}

          onChange={(e) => update("description", e.target.value)}

          rows={3}

          required

          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"

        />

      </div>



      <div>

        <label className="mb-2 block text-sm font-medium">

          Long Description

        </label>

        <textarea

          value={form.longDescription}

          onChange={(e) => update("longDescription", e.target.value)}

          rows={4}

          placeholder="Optional extended product description for detail page"

          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"

        />

      </div>



      <div className="flex flex-wrap gap-6">

        {(

          [

            ["featured", "Featured"],

            ["isNew", "New Arrival"],

            ["bestSeller", "Best Seller"],

          ] as const

        ).map(([key, label]) => (

          <label key={key} className="flex items-center gap-2 text-sm">

            <input

              type="checkbox"

              checked={form[key]}

              onChange={(e) => update(key, e.target.checked)}

              className="rounded border-neutral-300 text-primary focus:ring-primary"

            />

            {label}

          </label>

        ))}

      </div>



      {mode === "create" && (

        <p className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500 dark:bg-neutral-950">

          After creating the product, you&apos;ll be redirected to add variants

          (colors, sizes, pricing, and images).

        </p>

      )}



      {formError && (

        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">

          {formError}

        </p>

      )}



      <div className="flex gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">

        <Button

          type="submit"

          disabled={

            saving ||

            !form.brandId ||

            !form.categoryId ||

            availableCategories.length === 0

          }

        >

          {mode === "create" ? "Create Product" : "Save Changes"}

        </Button>

        <Button

          type="button"

          variant="outline"

          onClick={() => router.push("/admin/products")}

        >

          Cancel

        </Button>

      </div>

    </form>

  );

}


