import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityCard } from "./ActivityCard";
import type { Itinerary } from "@/types/clarification";

interface ItineraryCardProps {
  itineraryData: Itinerary;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({
  itineraryData,
}) => {
  const { itinerary, summary, followUpQuestions } = itineraryData;
  const [activeTab, setActiveTab] = useState(`day-${itinerary[0]?.day || 1}`);

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-2">Itinerary Not Available</h2>
        <p>We couldn't generate an itinerary based on the provided details.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg w-full mx-auto border border-gray-100 overflow-hidden">
      <div className="p-6 bg-gray-50/50">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          Your Personalized Trip Itinerary
        </h2>
        <p className="text-sm text-gray-600 mt-2">{summary}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 border-b border-gray-200">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-7 h-auto p-1.5">
            {itinerary.map(({ day }) => (
              <TabsTrigger
                key={`day-${day}`}
                value={`day-${day}`}
                className="text-xs sm:text-sm"
              >
                Day {day}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {itinerary.map(({ day, activities }) => (
          <TabsContent key={`day-content-${day}`} value={`day-${day}`}>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.map((activity, index) => (
                  <ActivityCard key={index} {...activity} />
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {followUpQuestions && followUpQuestions.length > 0 && (
        <div className="bg-blue-50/50 p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            A few more questions to perfect your plan:
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 list-disc list-inside">
            {followUpQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
