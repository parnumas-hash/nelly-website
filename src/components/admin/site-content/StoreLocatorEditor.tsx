"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SiteContentFormActions from "@/components/admin/site-content/SiteContentFormActions";
import { useCatalog } from "@/context/CatalogContext";
import { generateId } from "@/lib/admin/storage";
import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";
import { StoreLocation, StoreLocatorSection } from "@/types";

export default function StoreLocatorEditor() {
  const { homepageContent, updateHomepageContent, ready } = useCatalog();
  const [form, setForm] = useState<StoreLocatorSection>(
    homepageContent.storeLocator
  );

  useEffect(() => {
    setForm(homepageContent.storeLocator);
  }, [homepageContent.storeLocator]);

  if (!ready) {
    return <div className="py-20 text-center text-neutral-400">Loading...</div>;
  }

  const defaults = getDefaultHomepageContent().storeLocator;

  const updateStore = (index: number, patch: Partial<StoreLocation>) => {
    setForm((current) => ({
      ...current,
      stores: current.stores.map((store, i) =>
        i === index ? { ...store, ...patch } : store
      ),
    }));
  };

  const addStore = () => {
    setForm((current) => ({
      ...current,
      stores: [
        ...current.stores,
        {
          id: generateId(),
          name: "NELLY GROUP — New Store",
          address: "Street address",
          city: "Bangkok",
          hours: "Mon – Sun, 10:00 – 21:00",
          phone: "+66 2 000 0000",
          mapUrl: "https://maps.google.com",
        },
      ],
    }));
  };

  const removeStore = (index: number) => {
    setForm((current) => ({
      ...current,
      stores: current.stores.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-2">
        <Input
          id="stores-title"
          label="Heading"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          id="stores-description"
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        {form.stores.map((store, index) => (
          <div
            key={store.id}
            className="space-y-3 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Store {index + 1}</p>
              <button
                type="button"
                onClick={() => removeStore(index)}
                className="rounded-lg p-2 text-neutral-400 hover:text-red-500"
                aria-label="Remove store"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Input
              id={`store-name-${index}`}
              label="Store name"
              value={store.name}
              onChange={(e) => updateStore(index, { name: e.target.value })}
            />
            <Input
              id={`store-address-${index}`}
              label="Address"
              value={store.address}
              onChange={(e) => updateStore(index, { address: e.target.value })}
            />
            <Input
              id={`store-city-${index}`}
              label="City"
              value={store.city}
              onChange={(e) => updateStore(index, { city: e.target.value })}
            />
            <Input
              id={`store-hours-${index}`}
              label="Hours"
              value={store.hours}
              onChange={(e) => updateStore(index, { hours: e.target.value })}
            />
            <Input
              id={`store-phone-${index}`}
              label="Phone"
              value={store.phone}
              onChange={(e) => updateStore(index, { phone: e.target.value })}
            />
            <Input
              id={`store-map-${index}`}
              label="Map URL"
              value={store.mapUrl}
              onChange={(e) => updateStore(index, { mapUrl: e.target.value })}
            />
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addStore} className="gap-2">
        <Plus className="h-4 w-4" />
        Add store
      </Button>

      <SiteContentFormActions
        saveLabel="Save Store Locator"
        onSave={() => updateHomepageContent({ storeLocator: form })}
        onReset={() => setForm(defaults)}
      />
    </div>
  );
}
