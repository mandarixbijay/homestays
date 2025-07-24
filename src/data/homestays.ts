export interface Hero3Card {
  image: string;
  city: string;
  region: string;
  price: string;
  breakfast?: string;
  rating: number;
  slug: string;
}

export const hero3Data: Hero3Card[] = [
  {
    image: "/images/tophomestay/bandipur_homestay.avif",
    city: "Bandipur",
    region: "Bandipur, Nepal",
    price: "$54",
    breakfast: "Breakfast included",
    rating: 4.7,
    slug: "bandipur-homestay",
  },
  {
    image: "/images/tophomestay/solukhumbhu_homestay.jpg",
    city: "Solukhumbhu",
    region: "Solukhumbhu, Nepal",
    price: "$36",
    rating: 4.5,
    slug: "solukhumbhu-homestay",
  },
  {
    image: "/images/tophomestay/ghandruk_homestay.jpg",
    city: "Ghandruk",
    region: "Ghandruk, Nepal",
    price: "$18",
    breakfast: "Breakfast included",
    rating: 4.8,
    slug: "ghandruk-homestay",
  },
  {
    image: "/images/tophomestay/chitwan_homestay.jpg",
    city: "Chitwan",
    region: "Chitwan, Nepal",
    price: "$36",
    rating: 4.6,
    slug: "chitwan-homestay",
  },
  {
    image: "/images/tophomestay/palpa_homestay.jpg",
    city: "Palpa",
    region: "Palpa, Nepal",
    price: "$32",
    rating: 4.4,
    slug: "palpa-homestay",
  },
  {
    image: "/images/tophomestay/kathmandu_homestay.jpg",
    city: "Kathmandu",
    region: "Kathmandu, Nepal",
    price: "$34",
    breakfast: "Breakfast included",
    rating: 4.9, 
    slug: "kathmandu-homestay",
  },
  {
    image: "/images/tophomestay/syngja_homestay.jpg",
    city: "Syngja",
    region: "Syngja, Nepal",
    price: "$25",
    breakfast: "Breakfast included",
    rating: 4.7,
    slug: "syngja-homestay",
  },
];