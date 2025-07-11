import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Activity } from "@/types/clarification";

const PEXELS_API_KEY = "YOUR_PEXELS_API_KEY_HERE";
const PEXELS_API_URL = "https://api.pexels.com/v1/search";

async function fetchImage(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY || PEXELS_API_KEY === "YOUR_PEXELS_API_KEY_HERE") {
    console.warn("Pexels API key is not configured.");
    return null;
  }
  try {
    const response = await fetch(
      `${PEXELS_API_URL}?query=${query}&per_page=1`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );
    if (!response.ok) {
      console.error("Failed to fetch image from Pexels");
      return null;
    }
    const data = await response.json();
    return data.photos[0]?.src?.medium || null;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

export const ActivityCard: React.FC<Activity> = ({
  title,
  description,
  timeOfDay,
  imageQuery,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadImage() {
      setIsLoading(true);
      const url = await fetchImage(imageQuery);
      if (isMounted) {
        setImageUrl(url);
        setIsLoading(false);
      }
    }
    loadImage();
    return () => {
      isMounted = false;
    };
  }, [imageQuery]);

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="p-0 relative">
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Image not available</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-base font-bold mb-1">{title}</CardTitle>
        <p className="text-xs text-gray-500 uppercase font-semibold">
          {timeOfDay}
        </p>
        <p className="text-sm text-gray-700 mt-2">{description}</p>
      </CardContent>
    </Card>
  );
};
