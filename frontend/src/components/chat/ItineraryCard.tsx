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
      <div className="bg-slate-800/95 rounded-lg shadow-lg p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Itinerary Not Available</h2>
        <p className="text-slate-300">We couldn't generate an itinerary based on the provided details.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/95 rounded-xl shadow-lg w-full mx-auto border border-slate-700/50 overflow-hidden">
      <div className="mx-4 mt-4 p-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600/30">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          Your Personalized Trip Itinerary
        </h2>
        <p className="text-sm text-slate-300 mt-2">{summary}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 py-4">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-7 h-auto p-1.5 bg-slate-700/50 border border-slate-600/30">
            {itinerary.map(({ day }) => (
              <TabsTrigger
                key={`day-${day}`}
                value={`day-${day}`}
                className="text-xs sm:text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-slate-600/50 text-slate-300 hover:text-slate-100 transition-all rounded-md font-medium"
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
        <div className="mx-4 mb-4 p-6 bg-slate-700/30 border border-slate-600/30 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-100 mb-3">
            A few more questions to perfect your plan:
          </h3>
          <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
            {followUpQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
