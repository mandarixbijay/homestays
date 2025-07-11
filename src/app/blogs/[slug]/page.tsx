// src/app/blogs/[slug]/page.tsx
import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";
import Image from "next/image";
import { Metadata } from "next";
import SocialShare from "@/components/blog/SocialShare";

const blogPosts = [
  {
    slug: "hidden-gems-annapurna-circuit",
    image: "/images/blog_home/annapurna-circuit.avif",
    title: "Discovering the Hidden Gems of the Annapurna Circuit",
    author: "Anya Sharma",
    date: "January 15, 2024",
    excerpt: "The Annapurna Circuit, a trek through the Himalayas in Nepal, is renowned for its breathtaking scenery and cultural richness...",
    category: "Trekking",
    intro: `The Annapurna Circuit, a trek through the Himalayas in Nepal, is renowned for its breathtaking scenery and cultural richness. This journey offers more than just mountain views; it's an immersion into the heart of Nepalese life, where ancient traditions and stunning landscapes intertwine. Our adventure began in the bustling town of Besisahar, the starting point for many trekkers. From there, we ascended through lush green valleys, crossing suspension bridges over roaring rivers, and passing through charming villages where the warmth of the local people was as inviting as the aroma of dal bhat cooking in their homes.`,
    sections: [
      {
        text: `One of the highlights was our stay in a traditional homestay in the village of Chame. Here, we experienced the authentic hospitality of a local family, sharing meals and stories around a crackling fire. The food was simple yet incredibly flavorful, made with fresh ingredients sourced directly from their farm. It was a privilege to witness their daily routines, from tending to their crops to crafting intricate handicrafts. As we continued our trek, the landscape transformed dramatically. The verdant valleys gave way to rugged, rocky terrain, and the air grew thinner with each step. The challenge was exhilarating, and the panoramic views of snow-capped peaks were our constant reward. Crossing the Thorong La Pass, the highest point of the circuit at 5,416 meters (17,769 feet), was a monumental achievement. The sense of accomplishment, coupled with the awe-inspiring vista of the surrounding mountains, was an unforgettable moment.`,
      },
      {
        text: `Throughout our journey, we encountered diverse flora and fauna, from vibrant rhododendron forests to playful monkeys swinging through the trees. The trail was dotted with ancient monasteries and prayer flags fluttering in the wind, adding a spiritual dimension to our trek. Each day brought new discoveries, whether it was a hidden waterfall, a remote village, or a breathtaking sunrise over the mountains. The Annapurna Circuit is not just a trek; it's a transformative experience that leaves a lasting impression on the soul. It's a journey of self-discovery, a celebration of nature's grandeur, and a testament to the resilience and warmth of the Nepalese people. For those seeking an adventure that combines physical challenge with cultural immersion, the Annapurna Circuit is an unparalleled choice.`,
      },
    ],
    tips: [
      {
        label: "Best Time to Visit",
        desc: "The ideal trekking seasons are spring (March to May) and autumn (September to November) when the weather is generally clear and dry.",
      },
      {
        label: "Permits",
        desc: "Obtain the necessary permits, including the Annapurna Conservation Area Permit (ACAP) and the Trekkers' Information Management System (TIMS) card.",
      },
      {
        label: "Physical Fitness",
        desc: "The trek is challenging, so ensure you have a good level of fitness. Start training several months in advance with activities like hiking, running, and strength training.",
      },
      {
        label: "Acclimatization",
        desc: "Allow ample time for acclimatization to avoid altitude sickness. Include rest days and ascend gradually.",
      },
      {
        label: "Packing Essentials",
        desc: "Pack light but include essentials such as a good quality backpack, trekking poles, layers of clothing, a waterproof jacket, sturdy hiking boots, a first-aid kit, and a water filter or purification tablets.",
      },
      {
        label: "Guide or Porter",
        desc: "Consider hiring a guide or porter, especially if you are trekking for the first time or prefer a more supported experience. They can provide valuable insights, handle logistics, and carry your gear.",
      },
      {
        label: "Respect Local Culture",
        desc: "Be mindful of local customs and traditions. Dress modestly when visiting religious sites, ask permission before taking photos of people, and support local businesses by staying in homestays and purchasing goods from local vendors.",
      },
      {
        label: "Stay Connected",
        desc: "While the trek offers a chance to disconnect, it's essential to have a way to reach out in case of emergencies. Consider purchasing a local SIM card or renting a satellite phone.",
      },
      {
        label: "Travel Insurance",
        desc: "Ensure you have comprehensive travel insurance that covers trekking at high altitudes and potential medical emergencies.",
      },
    ],
  },
  {
    slug: "hidden-gems-bhaktapur",
    image: "/images/blog_home/gems-bhaktapur.avif",
    title: "Discovering the Hidden Gems of Bhaktapur",
    author: "Anya Sharma",
    date: "May 15, 2025",
    excerpt: "Bhaktapur, a UNESCO World Heritage Site, is a city that transports you back in time...",
    category: "Culture",
    intro: `Bhaktapur, a UNESCO World Heritage Site, is a city that transports you back in time. Known as the 'City of Devotees,' Bhaktapur is a cultural gem in Nepal, with its well-preserved medieval architecture, vibrant festivals, and bustling pottery squares. Our journey began at Durbar Square, where ancient palaces and temples stand as testaments to the city's rich history. The intricate wood carvings and the warm smiles of locals made every moment unforgettable.`,
    sections: [
      {
        text: `Wandering through Bhaktapur’s narrow cobblestone streets, we discovered hidden courtyards and local artisans crafting pottery with techniques passed down for generations. The Pottery Square was a highlight, with rows of clay pots drying in the sun and artisans spinning their wheels. We stayed at a local homestay, where we enjoyed traditional Newari cuisine, including yomari and spicy juju dhau (king curd). The cultural immersion was deepened by attending a local festival, where masked dancers performed ancient rituals under the glow of oil lamps.`,
      },
      {
        text: `Bhaktapur’s temples, like Nyatapola and Dattatreya, are architectural marvels, each telling a story of devotion and craftsmanship. The city’s vibrant markets, filled with handmade crafts and spices, offered a glimpse into daily life. Visiting during the Bisket Jatra festival, we witnessed the community’s spirit as they pulled a massive chariot through the streets. Bhaktapur is a living museum, blending history, culture, and warmth, making it a must-visit for anyone seeking Nepal’s cultural heart.`,
      },
    ],
    tips: [
      {
        label: "Best Time to Visit",
        desc: "Visit during spring (March-May) or autumn (September-November) for pleasant weather and vibrant festivals like Bisket Jatra.",
      },
      {
        label: "Entry Fee",
        desc: "Pay the Bhaktapur Durbar Square entry fee (approx. $15 for foreigners) to access the main heritage sites.",
      },
      {
        label: "Local Cuisine",
        desc: "Try Newari dishes like yomari, bara, and juju dhau at local eateries or homestays.",
      },
    ],
  },
  {
    slug: "weekend-getaway-pokhara",
    image: "/images/blog_home/getaway-pokhara.avif",
    title: "A Weekend Getaway in Pokhara",
    author: "Ravi Gurung",
    date: "April 20, 2025",
    excerpt: "Pokhara is the perfect escape for those seeking tranquility and adventure...",
    category: "Travel",
    intro: `Pokhara is the perfect escape for those seeking tranquility and adventure. Nestled beside Phewa Lake with the Annapurna range as a backdrop, this city offers a blend of natural beauty and thrilling activities. Our weekend began with a serene boat ride on Phewa Lake, where the reflections of snow-capped peaks created a postcard-perfect scene.`,
    sections: [
      {
        text: `We explored the vibrant Lakeside area, filled with cozy cafes and shops selling local handicrafts. A sunrise hike to Sarangkot offered breathtaking views of the Annapurna and Dhaulagiri ranges. For adventure seekers, paragliding over Pokhara was a highlight, soaring above the lake and lush hills. Our homestay experience introduced us to Gurung culture, with homemade meals and stories shared under starry skies.`,
      },
      {
        text: `Pokhara’s Peace Pagoda, perched atop a hill, provided a serene end to our trip. The city’s laid-back vibe, combined with opportunities for trekking, boating, and cultural exploration, makes it ideal for a weekend getaway. Whether you’re seeking relaxation or adrenaline, Pokhara delivers an unforgettable experience.`,
      },
    ],
    tips: [
      {
        label: "Best Time to Visit",
        desc: "Visit in autumn (September-November) for clear mountain views or spring (March-May) for pleasant weather.",
      },
      {
        label: "Activities",
        desc: "Try paragliding, boating on Phewa Lake, or hiking to Sarangkot for sunrise views.",
      },
      {
        label: "Accommodation",
        desc: "Stay in a lakeside homestay for an authentic cultural experience.",
      },
    ],
  },
  {
    slug: "wildlife-adventures-chitwan",
    image: "/images/blog_home/adventure-chitwan.avif",
    title: "Wildlife Adventures in Chitwan",
    author: "Maya Tamang",
    date: "March 10, 2023",
    excerpt: "Chitwan National Park is a haven for wildlife enthusiasts...",
    category: "Wildlife",
    intro: `Chitwan National Park is a haven for wildlife enthusiasts, offering a chance to spot rhinos, tigers, and exotic birds in their natural habitat. Our safari began at dawn, with the mist still clinging to the lush jungle. The excitement of tracking wildlife in this UNESCO World Heritage Site was unmatched.`,
    sections: [
      {
        text: `Our jeep safari took us deep into the park, where we spotted one-horned rhinos grazing and crocodiles basking by the Rapti River. A canoe ride offered a closer look at the park’s birdlife, including kingfishers and herons. Staying at a local homestay, we enjoyed Tharu cultural performances and learned about their traditions.`,
      },
      {
        text: `A guided jungle walk revealed the park’s diverse flora and fauna, from towering sal trees to elusive leopards. Chitwan is a paradise for nature lovers, blending adventure with cultural immersion. It’s a destination that leaves you with a deeper appreciation for Nepal’s biodiversity.`,
      },
    ],
    tips: [
      {
        label: "Best Time to Visit",
        desc: "Visit from October to March for cooler weather and optimal wildlife sightings.",
      },
      {
        label: "Safari Options",
        desc: "Choose between jeep safaris, canoe rides, or guided jungle walks for varied experiences.",
      },
      {
        label: "Cultural Experience",
        desc: "Attend a Tharu cultural show and stay in a local homestay for authentic hospitality.",
      },
    ],
  },
  {
    slug: "spiritual-journey-lumbini",
    image: "/images/blog_home/journey-lumbini.avif",
    title: "Spiritual Journey to Lumbini",
    author: "Suman Shrestha",
    date: "February 5, 2023",
    excerpt: "Lumbini, the birthplace of Lord Buddha, is a place of serenity and reflection...",
    category: "Spirituality",
    intro: `Lumbini, the birthplace of Lord Buddha, is a place of serenity and reflection. This UNESCO World Heritage Site attracts pilgrims and travelers seeking peace. Our journey began at the Maya Devi Temple, where we stood at the exact spot of Buddha’s birth, marked by an ancient stone.`,
    sections: [
      {
        text: `We explored the Sacred Garden, surrounded by ancient monasteries built by Buddhist communities worldwide. Meditating under the Bodhi tree was a profound experience, with prayer flags fluttering in the breeze. Our homestay in a nearby village offered a glimpse into rural Nepali life, with warm hosts and simple, delicious meals.`,
      },
      {
        text: `Visiting the Ashokan Pillar and various monasteries, each with unique architecture, deepened our understanding of Buddhist heritage. Lumbini’s tranquil atmosphere makes it a perfect destination for spiritual seekers and those looking to connect with history and peace.`,
      },
    ],
    tips: [
      {
        label: "Best Time to Visit",
        desc: "Visit in spring (March-May) or autumn (September-November) for comfortable weather.",
      },
      {
        label: "Respect the Site",
        desc: "Dress modestly and maintain silence in sacred areas like the Maya Devi Temple.",
      },
      {
        label: "Meditation",
        desc: "Join a meditation session at one of the monasteries for a deeper spiritual experience.",
      },
    ],
  },
];

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blogPost = blogPosts.find((post) => post.slug === slug);

  if (!blogPost) {
    return {
      title: "Post Not Found | Nepal Homestays",
      description: "The requested blog post could not be found.",
      metadataBase: new URL("https://nepalhomestays.com"),
    };
  }

  const metaDescription =
    blogPost.intro.length > 160 ? blogPost.intro.substring(0, 157) + "..." : blogPost.intro;

  return {
    title: `${blogPost.title} | Nepal Homestays`,
    description: metaDescription,
    keywords: `${blogPost.title}, Nepal, ${blogPost.category.toLowerCase()}, homestays, travel`,
    metadataBase: new URL("https://nepalhomestays.com"),
    robots: "index, follow",
    openGraph: {
      title: blogPost.title,
      description: metaDescription,
      images: [{ url: blogPost.image, width: 1200, height: 630, alt: blogPost.title }],
      url: `https://nepalhomestays.com/blogs/${blogPost.slug}`,
      type: "article",
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blogPost = blogPosts.find((post) => post.slug === slug);

  if (!blogPost) {
    return (
      <div className="bg-background min-h-screen font-manrope">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Blog Post Not Found</h1>
          <p className="text-text-secondary text-base mb-6">
            Sorry, we couldn’t find the blog post you’re looking for.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const wordCount =
    blogPost.intro.split(" ").length +
    blogPost.sections.reduce((acc, section) => acc + section.text.split(" ").length, 0) +
    blogPost.tips.reduce((acc, tip) => acc + tip.desc.split(" ").length, 0);
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="bg-background min-h-screen font-manrope">
      <Navbar />
      <section className="relative w-full h-56 sm:h-72 md:h-96 lg:h-[32rem] overflow-hidden mb-12">
        <Image
          src={blogPost.image}
          alt={blogPost.title}
          fill
          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
          <div className="text-center px-4 sm:px-6 md:px-8">
            <span className="inline-block px-3 py-1 mb-4 text-sm font-semibold text-white bg-primary rounded-md">
              {blogPost.category}
            </span>
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center max-w-4xl leading-tight drop-shadow-xl">
              {blogPost.title}
            </h1>
          </div>
        </div>
      </section>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <article className="animate-fade-in bg-card rounded-lg shadow-sm p-6 sm:p-8">
          <div className="flex justify-between items-center text-text-secondary text-sm mb-6">
            <div>
              By <span className="font-semibold text-text-primary">{blogPost.author}</span> • Published on {blogPost.date}
            </div>
            <div>{readingTime} min read</div>
          </div>
          <p className="text-base sm:text-lg text-text-primary mb-10 leading-relaxed">
            {blogPost.intro}
          </p>
          {blogPost.sections.map((section, idx) => (
            <section key={idx} className="mb-12 animate-fade-in">
              <p className="text-base sm:text-lg text-text-primary leading-relaxed">
                {section.text}
              </p>
              {idx < blogPost.sections.length - 1 && (
                <hr className="my-8 border-border" />
              )}
            </section>
          ))}
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">
              Tips for Planning Your {blogPost.category}
            </h2>
            <ul className="space-y-4">
              {blogPost.tips.map((tip, idx) => (
                <li key={idx} className="text-base sm:text-lg text-text-primary animate-fade-in">
                  <span className="font-semibold text-primary">{tip.label}:</span> {tip.desc}
                </li>
              ))}
            </ul>
          </section>
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">Share This Post</h2>
            <SocialShare slug={blogPost.slug} title={blogPost.title} />
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}