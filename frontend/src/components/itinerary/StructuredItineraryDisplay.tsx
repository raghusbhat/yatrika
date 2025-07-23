import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import * as ItineraryTypes from "@/types/itinerary";
import {
  MapPin,
  Clock,
  IndianRupee,
  Star,
  Calendar,
  Info,
  Utensils,
  Bed,
  Car,
  Share2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

interface StructuredItineraryDisplayProps {
  itinerary: ItineraryTypes.StructuredItinerary;
}

// Fixed Container Component for consistent width
const FixedContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <div className={`w-full max-w-6xl mx-auto px-4 ${className}`}>
    {children}
  </div>
);

// Simple Trip Header Component
const TripHeader = ({
  tripOverview,
  onShare
}: {
  tripOverview: ItineraryTypes.StructuredItinerary["tripOverview"];
  onShare: () => void;
}) => (
  <FixedContainer>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">
          {tripOverview.title}
        </h1>
        <p className="text-slate-400 text-sm">
          {tripOverview.duration} • {tripOverview.totalBudget}
        </p>
      </div>
      <Button 
        onClick={onShare}
        variant="outline" 
        size="sm" 
        className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Share</span>
      </Button>
    </div>
  </FixedContainer>
);

// Timeline Activity Component
const TimelineActivity = ({ 
  activity,
  isLast
}: { 
  activity: ItineraryTypes.Activity;
  isLast: boolean;
}) => (
  <div className="relative flex gap-4 pb-6">
    {/* Timeline Line */}
    {!isLast && (
      <div className="absolute left-8 top-16 w-0.5 h-full bg-slate-600"></div>
    )}
    
    {/* Time Badge */}
    <div className="flex-shrink-0 relative">
      <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden border-2 border-slate-600">
        <img
          src={ItineraryTypes.getPlaceholderImage(activity.location, 64, 64)}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
        {activity.time}
      </div>
    </div>

    {/* Activity Content */}
    <div className="flex-1 min-w-0 bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-100 mb-1">{activity.title}</h4>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{activity.location}</span>
            {activity.duration && (
              <>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>{activity.duration}</span>
              </>
            )}
            {activity.cost && (
              <>
                <span>•</span>
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">{activity.cost}</span>
              </>
            )}
          </div>
        </div>
        {activity.difficulty && (
          <Badge variant="outline" className={ItineraryTypes.DifficultyColors[activity.difficulty]}>
            {activity.difficulty}
          </Badge>
        )}
      </div>

      <p className="text-slate-300 mb-3 leading-relaxed">{activity.description}</p>

      {activity.tips && activity.tips.length > 0 && (
        <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-200 mb-1 text-sm">💡 Tips</p>
              <ul className="text-sm text-blue-300 space-y-1">
                {activity.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Day Tabs Itinerary Content with Timeline
const DailyItineraryContent = ({
  dailyItinerary,
}: {
  dailyItinerary: ItineraryTypes.StructuredItinerary["dailyItinerary"];
}) => {
  // Debug logging
  console.log('🔍 [DailyItinerary] Full data received:', {
    totalDays: dailyItinerary.length,
    days: dailyItinerary.map(d => ({ day: d.day, title: d.title, activitiesCount: d.activities.length }))
  });
  
  if (!dailyItinerary || dailyItinerary.length === 0) {
    console.error('❌ [DailyItinerary] No daily itinerary data received');
    return (
      <div className="w-full">
        <div className="text-center text-slate-400 py-8">
          No itinerary data available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs defaultValue={`day-${dailyItinerary[0]?.day || 1}`} className="w-full">
        {/* Scrollable Day Tabs */}
        <div className="w-full overflow-x-auto mb-6">
          <TabsList className="flex w-max min-w-full p-1 bg-slate-800/50 border border-slate-700/30 rounded-lg">
            {dailyItinerary.map((day) => {
              console.log(`🏷️ [DayTab] Rendering tab for Day ${day.day}:`, day.title);
              return (
                <TabsTrigger 
                  key={`day-${day.day}`}
                  value={`day-${day.day}`}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-slate-700/50 text-slate-300 transition-all rounded-md font-medium text-sm px-4 py-2 whitespace-nowrap flex-shrink-0 min-w-[100px]"
                >
                  Day {day.day}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        
        {/* Day Content */}
        <div className="w-full">
          {dailyItinerary.map((day) => (
            <TabsContent key={`day-content-${day.day}`} value={`day-${day.day}`} className="mt-0 w-full">
              <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/30 w-full">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700/50">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">{day.title}</h3>
                    <p className="text-sm text-slate-400">{day.date}</p>
                    {day.theme && (
                      <p className="text-sm text-blue-400 font-medium">{day.theme}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-0">
                  {day.activities.map((activity, activityIndex) => (
                    <TimelineActivity 
                      key={activityIndex} 
                      activity={activity}
                      isLast={activityIndex === day.activities.length - 1}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

// Hotels Content
const AccommodationsContent = ({
  accommodations,
}: {
  accommodations: ItineraryTypes.StructuredItinerary["accommodations"];
}) => (
  <div className="w-full">
    <div className="space-y-4">
      {accommodations.map((accommodation, index) => (
        <div key={index} className="bg-slate-800/50 rounded-lg border border-slate-700/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-100 mb-1">{accommodation.name}</h3>
              <p className="text-slate-400">{accommodation.type}</p>
            </div>
            {accommodation.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium text-slate-300">{accommodation.rating}</span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <IndianRupee className="w-4 h-4" />
              <span>{accommodation.priceRange}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4" />
              <span>{accommodation.location}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {accommodation.highlights.map((highlight, idx) => (
              <Badge key={idx} variant="secondary">
                {highlight}
              </Badge>
            ))}
          </div>
          
          {accommodation.bookingTip && (
            <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
              <p className="text-sm text-amber-300">💡 {accommodation.bookingTip}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Restaurants Content
const RestaurantsContent = ({
  restaurants,
}: {
  restaurants: ItineraryTypes.StructuredItinerary["restaurants"];
}) => (
  <div className="w-full">
    <div className="space-y-4">
      {restaurants.map((restaurant, index) => (
        <div key={index} className="bg-slate-800/50 rounded-lg border border-slate-700/30 p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-100 mb-1">{restaurant.name}</h3>
            <p className="text-slate-400">{restaurant.cuisine}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-slate-400">
              <IndianRupee className="w-4 h-4" />
              <span>{restaurant.priceRange}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4" />
              <span>{restaurant.location}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Must Try:</h4>
            <div className="flex flex-wrap gap-2">
              {restaurant.mustTry.map((item, idx) => (
                <Badge key={idx} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
          
          {restaurant.tip && (
            <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <p className="text-sm text-blue-300">💡 {restaurant.tip}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Budget Content
const BudgetContent = ({
  budgetBreakdown,
}: {
  budgetBreakdown: ItineraryTypes.StructuredItinerary["budgetBreakdown"];
}) => (
  <div className="w-full">
    <div className="bg-slate-800/50 rounded-lg border border-slate-700/30 p-6">
      <h3 className="text-xl font-semibold text-slate-100 mb-6">Budget Breakdown</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">Accommodation</span>
          </div>
          <span className="font-semibold text-slate-100">{budgetBreakdown.accommodation}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">Food & Dining</span>
          </div>
          <span className="font-semibold text-slate-100">{budgetBreakdown.food}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">Transportation</span>
          </div>
          <span className="font-semibold text-slate-100">{budgetBreakdown.transport}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">Activities</span>
          </div>
          <span className="font-semibold text-slate-100">{budgetBreakdown.activities}</span>
        </div>
        
        {budgetBreakdown.shopping && (
          <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Shopping</span>
            </div>
            <span className="font-semibold text-slate-100">{budgetBreakdown.shopping}</span>
          </div>
        )}
        
        <div className="border-t border-slate-600/50 pt-4">
          <div className="flex justify-between items-center p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-blue-400" />
              <span className="text-blue-200 font-semibold">Total Budget</span>
            </div>
            <span className="font-bold text-xl text-blue-100">{budgetBreakdown.total}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main Component with consistent width
export const StructuredItineraryDisplay: React.FC<StructuredItineraryDisplayProps> = ({ 
  itinerary 
}) => {
  const [copied, setCopied] = useState(false);

  // Debug the entire itinerary data
  console.log('🚀 [StructuredItineraryDisplay] Received itinerary:', {
    tripTitle: itinerary.tripOverview?.title,
    totalDays: itinerary.dailyItinerary?.length || 0,
    allDays: itinerary.dailyItinerary?.map(d => d.day) || [],
    accommodationsCount: itinerary.accommodations?.length || 0,
    restaurantsCount: itinerary.restaurants?.length || 0,
    hasBudget: !!itinerary.budgetBreakdown
  });

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: itinerary.tripOverview.title,
          text: itinerary.tripOverview.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-900">
      <div className="w-full py-6 space-y-8">
        {/* Simple Trip Header */}
        <TripHeader 
          tripOverview={itinerary.tripOverview}
          onShare={handleShare}
        />

        {/* Main Content with Fixed Width Container */}
        <FixedContainer>
          <Tabs defaultValue="itinerary" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-slate-800/50 p-1 border border-slate-700/30 rounded-lg">
              <TabsTrigger 
                value="itinerary" 
                className="flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-slate-700/50 text-slate-300 transition-all rounded-md font-medium"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Itinerary</span>
              </TabsTrigger>
              <TabsTrigger 
                value="hotels" 
                className="flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-slate-700/50 text-slate-300 transition-all rounded-md font-medium"
              >
                <Bed className="w-4 h-4" />
                <span className="hidden sm:inline">Hotels</span>
              </TabsTrigger>
              <TabsTrigger 
                value="food" 
                className="flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-slate-700/50 text-slate-300 transition-all rounded-md font-medium"
              >
                <Utensils className="w-4 h-4" />
                <span className="hidden sm:inline">Food</span>
              </TabsTrigger>
              <TabsTrigger 
                value="budget" 
                className="flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-slate-700/50 text-slate-300 transition-all rounded-md font-medium"
              >
                <IndianRupee className="w-4 h-4" />
                <span className="hidden sm:inline">Budget</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents with consistent width */}
            <div className="mt-6 w-full">
              <div className="min-h-[600px] w-full">
                <TabsContent value="itinerary" className="mt-0 w-full">
                  <DailyItineraryContent dailyItinerary={itinerary.dailyItinerary} />
                </TabsContent>

                <TabsContent value="hotels" className="mt-0 w-full">
                  <AccommodationsContent accommodations={itinerary.accommodations} />
                </TabsContent>

                <TabsContent value="food" className="mt-0 w-full">
                  <RestaurantsContent restaurants={itinerary.restaurants} />
                </TabsContent>

                <TabsContent value="budget" className="mt-0 w-full">
                  <BudgetContent budgetBreakdown={itinerary.budgetBreakdown} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </FixedContainer>

        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Link copied to clipboard!
          </motion.div>
        )}
      </div>
    </div>
  );
};