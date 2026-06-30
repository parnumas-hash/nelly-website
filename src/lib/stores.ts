export type { StoreLocation } from "@/types";
export { getDefaultHomepageContent } from "@/lib/admin/homepage-content";

import { getDefaultHomepageContent } from "@/lib/admin/homepage-content";

/** Default store list — prefer `homepageContent.storeLocator.stores` from catalog. */
export const stores = getDefaultHomepageContent().storeLocator.stores;
