import React from "react";

// Enhanced test component that can show structured itinerary data
export const SimpleItineraryTest: React.FC<{ itinerary?: any }> = ({ itinerary }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {itinerary?.tripOverview?.title || "Your Amazing Journey"}
        </h1>
        <p className="text-lg opacity-90 mb-4">
          {itinerary?.tripOverview?.description || "A personalized travel itinerary crafted just for you!"}
        </p>
        <div className="flex flex-wrap gap-2">
          {itinerary?.tripOverview?.highlights?.slice(0, 3).map((highlight: string, index: number) => (
            <span key={index} className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {highlight}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {itinerary?.dailyItinerary?.length || "3"}
          </div>
          <div className="text-sm text-green-700">Days</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {itinerary?.accommodations?.length || "1"}
          </div>
          <div className="text-sm text-blue-700">Hotels</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">
            {itinerary?.restaurants?.length || "3"}
          </div>
          <div className="text-sm text-orange-700">Restaurants</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {itinerary?.tripOverview?.totalBudget || "₹15,000"}
          </div>
          <div className="text-sm text-purple-700">Budget</div>
        </div>
      </div>

      {/* Sample Day Preview */}
      {itinerary?.dailyItinerary?.[0] && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Day 1: {itinerary.dailyItinerary[0].title}
          </h3>
          <div className="space-y-3">
            {itinerary.dailyItinerary[0].activities?.slice(0, 3).map((activity: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div>
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-sm text-gray-600">{activity.time} • {activity.location}</div>
                  <div className="text-sm text-gray-700 mt-1">{activity.description}</div>
                </div>
              </div>
            ))}
            {itinerary.dailyItinerary[0].activities?.length > 3 && (
              <div className="text-center text-sm text-gray-500 pt-2">
                ... and {itinerary.dailyItinerary[0].activities.length - 3} more activities
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-xl">✅</span>
          <div>
            <div className="font-medium text-green-800">Structured Itinerary Generated!</div>
            <div className="text-sm text-green-700">
              Your personalized travel plan is ready with detailed day-by-day activities, accommodations, and dining recommendations.
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info (can be removed later) */}
      <details className="bg-gray-50 rounded-lg p-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">
          Technical Details (Debug)
        </summary>
        <pre className="mt-2 text-xs text-gray-600 overflow-auto">
          {JSON.stringify(itinerary ? Object.keys(itinerary) : {}, null, 2)}
        </pre>
      </details>
    </div>
  );
};

// Helper function for activity icons
const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    sightseeing: "🏛️",
    food: "🍽️", 
    activity: "🎯",
    transport: "🚗",
    accommodation: "🏨",
    shopping: "🛍️",
    cultural: "🎭"
  };
  return icons[type] || "📍";
};
