import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Check, Search } from "lucide-react";
import { fetchAllCountries } from "@/components/pages/SettingsPage";

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  showCurrent?: boolean;
  onSelectDone?: () => void;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  showCurrent = true,
  onSelectDone,
}) => {
  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const prevSearchRef = useRef("");

  useEffect(() => {
    fetchAllCountries().then(setCountries);
  }, []);

  // Dynamically extract unique regions from countries
  const REGIONS = Array.from(new Set(countries.map((c) => c.region))).filter(
    Boolean
  );

  // Filter countries by search
  const filteredCountries = countries.filter((c) =>
    c.name.common.toLowerCase().includes(search.toLowerCase())
  );
  // Group countries by region
  const groupedCountries = REGIONS.map((region) => ({
    region,
    countries: filteredCountries
      .filter((c) => c.region === region)
      .sort((a, b) => a.name.common.localeCompare(b.name.common)),
  })).filter((group) => group.countries.length > 0);

  const selectedCountry = countries.find((c) => c.cca2 === value) ||
    countries.find((c) => c.cca2 === "US") || {
      cca2: "US",
      name: { common: "United States" },
      flags: { png: "https://flagsapi.com/US/flat/24.png" },
    };

  useEffect(() => {
    if (search.trim() === "") {
      if (prevSearchRef.current !== "") {
        setOpenGroups([]);
      }
    } else if (search !== prevSearchRef.current) {
      const groupsWithMatches = groupedCountries
        .filter((g) => g.countries.length > 0)
        .map((g) => g.region);
      setOpenGroups((prev) =>
        Array.from(new Set([...prev, ...groupsWithMatches]))
      );
    }
    prevSearchRef.current = search;
  }, [search, groupedCountries]);

  const handleAccordionChange = (values: string[]) => {
    setOpenGroups(values);
  };

  return (
    <div className="w-full">
      {showCurrent && selectedCountry && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-3 mb-3 rounded-lg bg-slate-950 border border-slate-800/50 shadow-sm"
          style={{ minHeight: 44 }}
        >
          <span className="text-white/50 mr-1">Current Country</span>
          <img
            src={selectedCountry.flag}
            alt={selectedCountry.name.common}
            style={{
              width: 32,
              height: 20,
              borderRadius: 6,
              objectFit: "cover",
            }}
          />
          <span className="text-base font-medium text-slate-100 ml-1">
            {selectedCountry.name.common}
          </span>
        </div>
      )}
      <div className="relative w-full mb-3">
        <Input
          className="pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400"
          placeholder="Type to search your country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      </div>
      <div className="w-full max-h-96 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 shadow-inner">
        <Accordion
          type="multiple"
          className="w-full"
          value={openGroups}
          onValueChange={handleAccordionChange}
        >
          {groupedCountries.map((group) => (
            <AccordionItem value={group.region} key={group.region}>
              <AccordionTrigger className="px-4 bg-slate-900 sticky top-0 z-10 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                {group.region}
              </AccordionTrigger>
              <AccordionContent className="p-0">
                {group.countries.map((c) => (
                  <div
                    key={c.cca2}
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors select-none
                      ${
                        value === c.cca2
                          ? "bg-indigo-800/80 text-white"
                          : "hover:bg-slate-800 text-slate-200"
                      }`}
                    onClick={() => {
                      onChange(c.cca2);
                      setSearch("");
                      setOpenGroups([]);
                      if (onSelectDone) onSelectDone();
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onChange(c.cca2);
                        setSearch("");
                        setOpenGroups([]);
                        if (onSelectDone) onSelectDone();
                      }
                    }}
                  >
                    <img
                      src={c.flag}
                      alt={c.name.common}
                      className="w-6 h-6 rounded"
                    />
                    <span className="flex-1 text-base">{c.name.common}</span>
                    {value === c.cca2 && (
                      <Check className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {filteredCountries.length === 0 && (
          <div className="px-4 py-2 text-slate-400">No countries found.</div>
        )}
      </div>
    </div>
  );
};
