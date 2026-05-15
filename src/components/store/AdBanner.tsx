"use client";

import { memo, useEffect, useState } from "react";

interface Ad {
  id: string;
  title: string;
  image: string;
  link?: string;
}

const AdBanner = memo(function AdBanner({ placement }: { placement: string }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ads?placement=${placement}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ads) {
          setAds(data.ads);
        }
      })
      .catch((err) => console.error("Failed to load ads", err))
      .finally(() => setLoading(false));
  }, [placement]);

  if (loading || ads.length === 0) return null;

  return (
    <div className="container-custom py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ads.map((ad) => (
          <a
            key={ad.id}
            href={ad.link || "#"}
            target={ad.link ? "_blank" : undefined}
            rel="noreferrer"
            className={`block relative overflow-hidden rounded-2xl group shadow-sm w-full ${!ad.link && 'cursor-default'}`}
          >
            <img
              src={ad.image}
              alt={ad.title}
              className="w-full h-32 md:h-40 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none flex items-end p-4">
              <h3 className="text-white font-bold text-lg drop-shadow-md line-clamp-1">{ad.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});

export default AdBanner;
