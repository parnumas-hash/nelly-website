export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  hours: string;
  phone: string;
  mapUrl: string;
}

export const stores: StoreLocation[] = [
  {
    id: "1",
    name: "NELLY GROUP — Siam Paragon",
    address: "991 Rama I Rd, Pathum Wan",
    city: "Bangkok 10330",
    hours: "Mon – Sun, 10:00 – 21:00",
    phone: "+66 2 123 4567",
    mapUrl: "https://maps.google.com",
  },
  {
    id: "2",
    name: "NELLY GROUP — Central Embassy",
    address: "1031 Ploenchit Rd, Lumphini",
    city: "Bangkok 10330",
    hours: "Mon – Sun, 10:00 – 22:00",
    phone: "+66 2 234 5678",
    mapUrl: "https://maps.google.com",
  },
  {
    id: "3",
    name: "NELLY GROUP — EmQuartier",
    address: "693 Sukhumvit Rd, Khlong Tan Nuea",
    city: "Bangkok 10110",
    hours: "Mon – Sun, 10:00 – 22:00",
    phone: "+66 2 345 6789",
    mapUrl: "https://maps.google.com",
  },
];
