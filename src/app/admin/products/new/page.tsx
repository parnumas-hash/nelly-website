import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
        Add Product
      </h1>
      <p className="mb-8 text-neutral-500">Create a new product for your store.</p>
      <div className="max-w-4xl rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 md:p-8">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
