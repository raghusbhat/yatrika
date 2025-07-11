import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as ItineraryTypes from "@/types/itinerary";
import {
  MapPin,
  Clock,
  IndianRupee,
  Star,
  Calendar,
  Camera,
  Instagram,
  ExternalLink,
  Info,
  Utensils,
  Bed,
  Car,
  ShoppingBag,
} from "lucide-react";

interface StructuredItineraryDisplayProps {
  itinerary: ItineraryTypes.StructuredItinerary;
}

// Trip Overview Hero Component
const TripOverviewCard = ({
  tripOverview,
}: {
  tripOverview: ItineraryTypes.StructuredItinerary["tripOverview"];
}) => (
  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-xl border border-slate-700">
    <div className="absolute inset-0 bg-black opacity-30"></div>
    <div className="relative p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {tripOverview.title}
          </h1>
          <p className="text-lg mb-4 opacity-90">{tripOverview.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {tripOverview.highlights.map((highlight, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                {highlight}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{tripOverview.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee size={16} />
              <span>{tripOverview.totalBudget}</span>
            </div>
          </div>
        </div>

        <div className="md:w-80">
          <img
            src={ItineraryTypes.getPlaceholderImage(tripOverview.title)}
            alt={tripOverview.title}
            className="w-full h-48 md:h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  </div>
);

// Activity Card Component
const ActivityCard = ({ activity }: { activity: ItineraryTypes.Activity }) => (
  <Card className="mb-4 hover:shadow-xl transition-all duration-200 bg-slate-800 border-slate-700 hover:border-slate-600">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {ItineraryTypes.ActivityTypeIcons[activity.type]}
          </div>
          <div>
            <h4 className="font-semibold text-lg text-slate-100">
              {activity.title}
            </h4>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{activity.time}</span>
              </div>
              {activity.duration && <span>• {activity.duration}</span>}
              {activity.cost && (
                <div className="flex items-center gap-1">
                  <IndianRupee size={14} />
                  <span>{activity.cost}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {activity.difficulty && (
          <Badge
            className={ItineraryTypes.DifficultyColors[activity.difficulty]}
          >
            {activity.difficulty}
          </Badge>
        )}
      </div>

      <p className="text-slate-300 mb-3">{activity.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-slate-400">
          <MapPin size={14} />
          <span>{activity.location}</span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href={ItineraryTypes.getGoogleMapsUrl(activity.location)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={14} className="mr-1" />
              Map
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={ItineraryTypes.getInstagramSearchUrl(activity.location)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={14} className="mr-1" />
              Photos
            </a>
          </Button>
        </div>
      </div>

      {activity.tips && activity.tips.length > 0 && (
        <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700/50 rounded-md">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-300 mb-1">
                Pro Tips:
              </p>
              <ul className="text-sm text-blue-200 space-y-1">
                {activity.tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

// Daily Itinerary Component
const DailyItineraryTab = ({
  dailyItinerary,
}: {
  dailyItinerary: ItineraryTypes.StructuredItinerary["dailyItinerary"];
}) => (
  <div className="space-y-6">
    {dailyItinerary.map((day) => (
      <Card
        key={day.day}
        className="overflow-hidden bg-slate-800 border-slate-700"
      >
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-b border-slate-700">
          <CardTitle className="flex items-center justify-between">
            <span>
              Day {day.day}: {day.title}
            </span>
            <span className="text-sm opacity-90">{day.date}</span>
          </CardTitle>
          {day.theme && <p className="text-sm opacity-90">{day.theme}</p>}
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {day.activities.map((activity, index) => (
              <ActivityCard key={index} activity={activity} />
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Accommodations Component
const AccommodationsTab = ({
  accommodations,
}: {
  accommodations: ItineraryTypes.StructuredItinerary["accommodations"];
}) => (
  <div className="grid md:grid-cols-2 gap-6">
    {accommodations.map((accommodation, index) => (
      <Card
        key={index}
        className="overflow-hidden bg-slate-800 border-slate-700"
      >
        <div className="h-48 bg-gradient-to-br from-purple-600 to-pink-600"></div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-100">
                {accommodation.name}
              </h3>
              <p className="text-slate-400">{accommodation.type}</p>
            </div>
            {accommodation.rating && (
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-current" />
                <span className="font-medium">{accommodation.rating}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300">
              <IndianRupee size={16} className="text-slate-400" />
              <span>{accommodation.priceRange}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <MapPin size={16} className="text-slate-400" />
              <span>{accommodation.location}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {accommodation.highlights.map((highlight, idx) => (
                <Badge key={idx} variant="outline">
                  {highlight}
                </Badge>
              ))}
            </div>

            {accommodation.bookingTip && (
              <div className="p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-md">
                <p className="text-sm text-yellow-200">
                  💡 {accommodation.bookingTip}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Main Component
export const StructuredItineraryDisplay: React.FC<
  StructuredItineraryDisplayProps
> = ({ itinerary }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-slate-900 min-h-screen">
      {/* Trip Overview Hero */}
      <TripOverviewCard tripOverview={itinerary.tripOverview} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="itinerary" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="itinerary" className="flex items-center gap-2">
            <Calendar size={16} />
            <span className="hidden sm:inline">Itinerary</span>
          </TabsTrigger>
          <TabsTrigger
            value="accommodations"
            className="flex items-center gap-2"
          >
            <Bed size={16} />
            <span className="hidden sm:inline">Hotels</span>
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="flex items-center gap-2">
            <Utensils size={16} />
            <span className="hidden sm:inline">Food</span>
          </TabsTrigger>
          <TabsTrigger value="transport" className="flex items-center gap-2">
            <Car size={16} />
            <span className="hidden sm:inline">Transport</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <IndianRupee size={16} />
            <span className="hidden sm:inline">Budget</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary" className="mt-6">
          <DailyItineraryTab dailyItinerary={itinerary.dailyItinerary} />
        </TabsContent>

        <TabsContent value="accommodations" className="mt-6">
          <AccommodationsTab accommodations={itinerary.accommodations} />
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="restaurants" className="mt-6">
          <div className="text-center py-8 text-slate-400 bg-slate-800 rounded-lg border border-slate-700">
            Restaurant recommendations coming soon...
          </div>
        </TabsContent>

        <TabsContent value="transport" className="mt-6">
          <div className="text-center py-8 text-slate-400 bg-slate-800 rounded-lg border border-slate-700">
            Transportation details coming soon...
          </div>
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <div className="text-center py-8 text-slate-400 bg-slate-800 rounded-lg border border-slate-700">
            Budget breakdown coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
