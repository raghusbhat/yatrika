import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { useLocale } from "@/lib/LocaleProvider";
import { Globe, BadgeIndianRupee, Bell, GaugeCircle } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getTimeZones } from "@vvo/tzdb";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";

const NOTIFICATION_PREFS = [
  {
    key: "email",
    label: "Email Notifications",
    desc: "Receive updates and offers via email",
  },
  {
    key: "push",
    label: "Push Notifications",
    desc: "Receive alerts on your device",
  },
  {
    key: "price",
    label: "Price Alerts",
    desc: "Get notified when prices drop",
  },
  {
    key: "marketing",
    label: "Marketing Communications",
    desc: "Promotional offers and deals",
  },
  {
    key: "travel",
    label: "Travel Updates",
    desc: "Flight status and itinerary changes",
  },
  {
    key: "security",
    label: "Account Security",
    desc: "Login alerts and security notifications",
  },
];

const ADDRESS_KEY = "user_address";
const UNITS_KEY = "user_units";
const TRAVEL_PREFS_KEY = "user_travel_prefs";
const PREFS_KEY = "user_prefs";

const defaultTravelPrefs = (country) => ({
  travelClass: "economy",
  dietary: country === "IN" ? "Vegetarian" : "No preference",
  accessibility: "",
  favorites: "",
});
const defaultAddress = (geo, country) => ({
  line1: "",
  line2: "",
  city: geo?.city || "",
  state: geo?.region || "",
  postal: geo?.postal || "",
  country: geo?.country || country || "",
  phone: "",
});

function getUnitsForMetric(countryCode: string) {
  // US, Liberia, Myanmar use imperial
  if (countryCode === "US" || countryCode === "LR" || countryCode === "MM")
    return { distance: "miles", temperature: "F", weight: "lb" };
  // UK uses miles for distance, but metric for others
  if (countryCode === "GB")
    return { distance: "miles", temperature: "C", weight: "kg" };
  // Default: metric
  return { distance: "km", temperature: "C", weight: "kg" };
}

// Utility: Fetch and cache all countries with best practices
const COUNTRY_CACHE_KEY = "restcountries_all";
const COUNTRY_CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function fetchAllCountries() {
  const cached = localStorage.getItem(COUNTRY_CACHE_KEY);
  if (cached) {
    try {
      const { data, ts } = JSON.parse(cached);
      if (data && ts && Date.now() - ts < COUNTRY_CACHE_TTL) {
        return data;
      }
    } catch {
      localStorage.removeItem(COUNTRY_CACHE_KEY);
    }
  }
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=cca2,name,region,currencies,timezones,flags"
    );
    if (!res.ok) throw new Error("Failed to fetch all countries");
    let data = await res.json();
    // Only keep needed fields and use flags.svg (not png)
    data = data.map((c) => ({
      cca2: c.cca2,
      name: c.name,
      region: c.region,
      currencies: c.currencies,
      timezones: c.timezones,
      flag: c.flags?.svg || "",
    }));
    localStorage.setItem(
      COUNTRY_CACHE_KEY,
      JSON.stringify({ data, ts: Date.now() })
    );
    return data;
  } catch (e) {
    // Graceful fallback: try to use old cache if available
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        return data;
      } catch {}
    }
    throw e;
  }
}

const SettingsPage: React.FC = () => {
  const { country, setCountry } = useLocale();
  const countryCode = country || "IN";
  const [countryData, setCountryData] = useState<any>(null);
  const [timezone, setTimezone] = useState("");
  // Preferences state
  const [prefs, setPrefs] = useState({
    currency: countryData?.currencies?.[0]?.code || "INR",
    dateFormat: "auto",
    autoConvert: true,
  });
  // Address state
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal: "",
    country: countryCode,
    phone: "",
  });
  // Units state
  const [units, setUnits] = useState(
    getUnitsForMetric(countryData?.region?.code || "IN")
  );
  // Travel prefs state
  const [travelPrefs, setTravelPrefs] = useState(
    defaultTravelPrefs(countryCode)
  );
  // Notification state
  const [notif, setNotif] = useState({
    email: true,
    push: false,
    price: true,
    marketing: false,
    travel: true,
    security: true,
  });
  // Prefill loading
  const [loading, setLoading] = useState(false);
  const [allCurrencies, setAllCurrencies] = useState<
    { code: string; name: string }[]
  >([]);
  const [allTimezones, setAllTimezones] = useState<
    { name: string; gmtOffset: string; label: string }[]
  >([]);
  // Timezone search input state
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  // Canonical timezone mapping for major countries
  const CANONICAL_TIMEZONES: Record<string, string> = {
    IN: "Asia/Kolkata",
    GB: "Europe/London",
    FR: "Europe/Paris",
    DE: "Europe/Berlin",
    IT: "Europe/Rome",
    ES: "Europe/Madrid",
    US: "America/New_York",
    CA: "America/Toronto",
    AU: "Australia/Sydney",
    JP: "Asia/Tokyo",
    CN: "Asia/Shanghai",
    RU: "Europe/Moscow",
    BR: "America/Sao_Paulo",
    // Add more as needed
  };

  // Fetch country data when countryCode changes
  useEffect(() => {
    let isMounted = true;
    // [YATRIKA][UNITS] countryCode changed
    fetchAllCountries().then((allCountries) => {
      const data = allCountries.find((c) => c.cca2 === countryCode);
      if (isMounted && data) {
        setCountryData(data);
        setTimezone(data.timezones?.[0] || "");
        // Always set currency to country default
        const defaultCurrency =
          data.currencies && Object.keys(data.currencies).length > 0
            ? Object.keys(data.currencies)[0]
            : "INR";
        setPrefs((prev) => ({ ...prev, currency: defaultCurrency }));
        // Always set units to country default
        // (unit logic moved to countryData effect)
      }
    });
    return () => {
      isMounted = false;
    };
  }, [countryCode, allCurrencies]);

  useEffect(() => {
    setLoading(true);
    const savedAddr = localStorage.getItem(ADDRESS_KEY);
    const savedUnits = localStorage.getItem(UNITS_KEY);
    const savedPrefs = localStorage.getItem(TRAVEL_PREFS_KEY);
    const savedUserPrefs = localStorage.getItem(PREFS_KEY);
    const savedNotif = localStorage.getItem("user_notif");
    const savedTimezone = localStorage.getItem("user_timezone");
    if (savedAddr) setAddress(JSON.parse(savedAddr));
    if (savedUnits) setUnits(JSON.parse(savedUnits));
    if (savedPrefs) setTravelPrefs(JSON.parse(savedPrefs));
    if (savedUserPrefs) setPrefs(JSON.parse(savedUserPrefs));
    if (savedNotif) setNotif(JSON.parse(savedNotif));
    if (savedTimezone) setTimezone(savedTimezone);
    // Remove all direct property access on getCountryData(countryCode)
    // Set currency and units to country defaults on country change using countryData
    // Only update when countryData is available
  }, [countryCode]);

  // After countryData is set, auto-populate currency if needed
  useEffect(() => {
    // If countryData is loaded and has currencies, and prefs.currency is not set or not in the list, set to default
    const defaultCurrency =
      countryData &&
      countryData.currencies &&
      Object.keys(countryData.currencies).length > 0
        ? Object.keys(countryData.currencies)[0]
        : "INR";
    console.log(
      "[YATRIKA][CURRENCY][countryData effect] countryData:",
      countryData
    );
    console.log(
      "[YATRIKA][CURRENCY][countryData effect] Detected currencies:",
      countryData?.currencies
    );
    console.log(
      "[YATRIKA][CURRENCY][countryData effect] Current prefs.currency:",
      prefs.currency,
      "Default currency:",
      defaultCurrency
    );
    if (
      countryData &&
      defaultCurrency &&
      prefs.currency !== defaultCurrency &&
      (!countryData.currencies ||
        !countryData.currencies.some((c: any) => c.code === prefs.currency))
    ) {
      setPrefs((prev) => {
        console.log(
          "[YATRIKA][CURRENCY][countryData effect] Setting prefs.currency to",
          defaultCurrency
        );
        return { ...prev, currency: defaultCurrency };
      });
    }
  }, [countryData]);

  // Update units when countryData changes
  useEffect(() => {
    if (countryData && countryData.cca2) {
      const defaultUnits = getUnitsForMetric(countryData.cca2);
      setUnits(defaultUnits);
      localStorage.setItem(UNITS_KEY, JSON.stringify(defaultUnits));
      console.log(
        "[YATRIKA][UNITS][countryData effect] country:",
        countryData.cca2,
        "units set to:",
        defaultUnits
      );
    }
  }, [countryData]);

  // Save handlers
  const saveAddress = (a) => {
    setAddress(a);
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(a));
  };
  const saveUnits = (u) => {
    setUnits(u);
    localStorage.setItem(UNITS_KEY, JSON.stringify(u));
  };
  const saveTravelPrefs = (p) => {
    setTravelPrefs(p);
    localStorage.setItem(TRAVEL_PREFS_KEY, JSON.stringify(p));
  };
  const savePrefs = (p) => {
    setPrefs(p);
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  };
  const saveNotif = (n) => {
    setNotif(n);
    localStorage.setItem("user_notif", JSON.stringify(n));
  };
  const saveTimezone = (tz) => {
    setTimezone(tz);
    localStorage.setItem("user_timezone", tz);
  };

  // UI helpers
  const handleAddrChange = (k, v) =>
    saveAddress({ ...(address || {}), [k]: v });
  const handleUnitChange = (k, v) => saveUnits({ ...(units || {}), [k]: v });
  const handleTravelChange = (k, v) =>
    saveTravelPrefs({ ...(travelPrefs || {}), [k]: v });
  const handlePrefsChange = (k, v) => savePrefs({ ...(prefs || {}), [k]: v });
  const handleNotifChange = (k, v) => saveNotif({ ...(notif || {}), [k]: v });

  // After fetching all countries, extract unique currencies
  useEffect(() => {
    fetchAllCountries().then((allCountries) => {
      // Extract all unique currencies (currencies is an object, not array)
      const currencyMap = new Map();
      allCountries.forEach((c) => {
        if (c.currencies && typeof c.currencies === "object") {
          Object.entries(c.currencies).forEach(([code, cur]) => {
            const currencyObj = cur as { name?: string };
            if (code && currencyObj.name)
              currencyMap.set(code, currencyObj.name);
          });
        }
      });
      const currencyList = Array.from(currencyMap.entries()).map(
        ([code, name]) => ({ code, name })
      );
      currencyList.sort((a, b) => a.name.localeCompare(b.name));
      console.log("[Currency Dropdown] allCurrencies:", currencyList);
      setAllCurrencies(currencyList);
    });
  }, []);

  useEffect(() => {
    console.log("[Currency Dropdown] prefs:", prefs);
    console.log("[Currency Dropdown] countryData:", countryData);
  }, [prefs, countryData, allCurrencies]);

  // Extract all unique IANA timezones with GMT offsets
  useEffect(() => {
    // getTimeZones() returns an array of tz objects, each with name, currentTimeFormat, and main cities/labels
    const tzList = getTimeZones().map((tz) => {
      const offset = tz.currentTimeFormat;
      const gmtOffset = offset.startsWith("-")
        ? `(GMT${offset})`
        : `(GMT+${offset.replace("+", "")})`;
      // Compose a label that includes all city/region names and the IANA name
      // tz.mainCities is an array of city names, tz.rawFormat contains the label
      const label = tz.rawFormat || tz.name;
      return { name: tz.name, gmtOffset, label };
    });
    setAllTimezones(tzList);
  }, []);

  // On country change, auto-select the most likely timezone
  useEffect(() => {
    if (countryData && allTimezones.length > 0) {
      const countryCode = countryData.cca2;
      // 1. Prefer canonical timezone if mapped
      if (CANONICAL_TIMEZONES[countryCode]) {
        const canonicalTz = allTimezones.find(
          (tz) => tz.name === CANONICAL_TIMEZONES[countryCode]
        );
        if (canonicalTz) {
          setTimezone(canonicalTz.name);
          console.log(
            "[YATRIKA][TIMEZONE] Auto-selected canonical timezone:",
            canonicalTz.name
          );
          return;
        }
      }
      // 2. Prefer a timezone with capital in name or label
      const capital = Array.isArray(countryData.capital)
        ? countryData.capital[0]
        : countryData.capital;
      if (capital) {
        const capitalTz = allTimezones.find(
          (tz) =>
            tz.name.toLowerCase().includes(capital.toLowerCase()) ||
            tz.label.toLowerCase().includes(capital.toLowerCase())
        );
        if (capitalTz) {
          setTimezone(capitalTz.name);
          console.log(
            "[YATRIKA][TIMEZONE] Auto-selected by capital in name/label:",
            capitalTz.name
          );
          return;
        }
      }
      // 3. Prefer a timezone with country name in label
      const countryName =
        countryData.name?.common?.toLowerCase() ||
        countryData.name?.toLowerCase() ||
        "";
      const countryTz = allTimezones.find((tz) =>
        tz.label.toLowerCase().includes(countryName)
      );
      if (countryTz) {
        setTimezone(countryTz.name);
        console.log(
          "[YATRIKA][TIMEZONE] Auto-selected by country name in label:",
          countryTz.name
        );
        return;
      }
      // 4. Fallback: match by GMT offset (use first timezone in countryData.timezones)
      const countryUtc = countryData.timezones?.[0];
      if (countryUtc) {
        const gmtString = countryUtc.replace("UTC", "GMT");
        const gmtMatch = allTimezones.find((tz) =>
          tz.gmtOffset.includes(gmtString)
        );
        if (gmtMatch) {
          setTimezone(gmtMatch.name);
          console.log(
            "[YATRIKA][TIMEZONE] Auto-selected by GMT offset:",
            gmtMatch.name
          );
          return;
        }
      }
      // 5. Fallback: first timezone in the list
      setTimezone(allTimezones[0].name);
      console.log(
        "[YATRIKA][TIMEZONE] Fallback to first timezone:",
        allTimezones[0].name
      );
    }
  }, [countryData, allTimezones]);

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center bg-slate-950 px-2 py-8">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        {/* Country Card */}
        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-lg text-white">Country</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <CountrySelect
              value={countryCode}
              onChange={setCountry}
              showCurrent={true}
            />
          </CardContent>
        </Card>

        {/* Currency Card */}
        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <BadgeIndianRupee className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-lg text-white">Currency</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <CurrencyCombobox
              prefs={prefs}
              setPrefs={setPrefs}
              allCurrencies={allCurrencies}
            />
            <div className="bg-slate-800 rounded-xl px-4 py-3 flex flex-col gap-1">
              <div className="flex justify-between text-slate-300 text-sm">
                <span>Base Currency</span>
                <span>{prefs.currency}</span>
              </div>
              <div className="flex justify-between text-slate-300 text-sm">
                <span>Exchange Rate</span>
                <span>1 USD = 83.12 INR</span>
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="text-slate-200 font-medium">
                  Auto-convert prices
                </div>
                <div className="text-xs text-slate-400">
                  Automatically convert prices to your preferred currency when
                  browsing.
                </div>
              </div>
              <Switch
                checked={prefs.autoConvert}
                onCheckedChange={(v) => handlePrefsChange("autoConvert", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timezone Card */}
        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-lg text-white">Timezone</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <TimezoneCombobox
              timezone={timezone}
              setTimezone={setTimezone}
              allTimezones={allTimezones}
            />
          </CardContent>
        </Card>

        {/* Measurement Units Card */}
        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <GaugeCircle className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-lg text-white">
              Measurement Units
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {(() => {
              console.log(
                "[YATRIKA][UNITS][UI render] Rendering units:",
                units
              );
              return null;
            })()}
            <div>
              <Label className="mb-2 block">Distance</Label>
              <ToggleGroup
                type="single"
                value={units.distance}
                onValueChange={(v) => handleUnitChange("distance", v)}
                className="flex gap-2 bg-slate-800 border border-slate-700 rounded-lg p-2"
              >
                <ToggleGroupItem
                  value="km"
                  className="cursor-pointer px-4 py-2 rounded-md data-[state=on]:bg-indigo-600 data-[state=on]:text-white data-[state=off]:bg-slate-900 data-[state=off]:text-slate-300"
                >
                  Kilometers (km)
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="miles"
                  className="cursor-pointer px-4 py-2 rounded-md data-[state=on]:bg-indigo-600 data-[state=on]:text-white data-[state=off]:bg-slate-900 data-[state=off]:text-slate-300"
                >
                  Miles (mi)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div>
              <Label className="mb-2 block">Temperature</Label>
              <ToggleGroup
                type="single"
                value={units.temperature}
                onValueChange={(v) => handleUnitChange("temperature", v)}
                className="flex gap-2 bg-slate-800 border border-slate-700 rounded-lg p-2"
              >
                <ToggleGroupItem
                  value="C"
                  className="cursor-pointer px-4 py-2 rounded-md data-[state=on]:bg-indigo-600 data-[state=on]:text-white data-[state=off]:bg-slate-900 data-[state=off]:text-slate-300"
                >
                  Celsius (°C)
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="F"
                  className="cursor-pointer px-4 py-2 rounded-md data-[state=on]:bg-indigo-600 data-[state=on]:text-white data-[state=off]:bg-slate-900 data-[state=off]:text-slate-300"
                >
                  Fahrenheit (°F)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div>
              <Label className="mb-2 block">Weight</Label>
              <ToggleGroup
                type="single"
                value={units.weight}
                onValueChange={(v) => handleUnitChange("weight", v)}
                className="flex gap-2 bg-slate-800 border border-slate-700 rounded-lg p-2"
              >
                <ToggleGroupItem
                  value="kg"
                  className="cursor-pointer px-4 py-2 rounded-md data-[state=on]:bg-indigo-600 data-[state=on]:text-white data-[state=off]:bg-slate-900 data-[state=off]:text-slate-300"
                >
                  Kilograms (kg)
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="lb"
                  className="cursor-pointer px-4 py-2 rounded-md data-[state=on]:bg-indigo-600 data-[state=on]:text-white data-[state=off]:bg-slate-900 data-[state=off]:text-slate-300"
                >
                  Pounds (lb)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences Card */}
        <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-lg text-white">
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NOTIFICATION_PREFS.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center bg-slate-800 rounded-xl px-4 py-3"
                >
                  <div className="flex-1">
                    <div className="text-slate-200 font-medium">
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                  <Switch
                    checked={notif[item.key]}
                    onCheckedChange={(v) => handleNotifChange(item.key, v)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// TimezoneCombobox: Popover+Command combobox for timezone selection
const TimezoneCombobox: React.FC<{
  timezone: string;
  setTimezone: (tz: string) => void;
  allTimezones: { name: string; gmtOffset: string; label: string }[];
}> = ({ timezone, setTimezone, allTimezones }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedTz = allTimezones.find((t) => t.name === timezone);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-full justify-between min-w-0"
          onClick={() => setOpen(true)}
        >
          <span
            className="truncate block max-w-full"
            title={
              selectedTz
                ? `${selectedTz.gmtOffset} ${selectedTz.label} / ${selectedTz.name}`
                : "Select timezone..."
            }
          >
            {selectedTz
              ? `${selectedTz.gmtOffset} ${selectedTz.label} / ${selectedTz.name}`
              : "Select timezone..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command className="bg-slate-900">
          <CommandInput
            placeholder="Search timezone..."
            className="h-9"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="bg-slate-900">
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              {allTimezones
                .filter((tz) =>
                  `${tz.name} ${tz.gmtOffset} ${tz.label}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((tz) => (
                  <CommandItem
                    key={tz.name}
                    value={`${tz.name} ${tz.gmtOffset} ${tz.label}`.toLowerCase()}
                    onSelect={() => {
                      setTimezone(tz.name);
                      setOpen(false);
                    }}
                    className="truncate max-w-full bg-slate-900 text-slate-200 hover:bg-slate-800"
                  >
                    <Check
                      className={
                        "mr-2 h-4 w-4 " +
                        (timezone === tz.name ? "opacity-100" : "opacity-0")
                      }
                    />
                    <span className="truncate w-full block align-middle">
                      {tz.gmtOffset} {tz.label} / {tz.name}
                    </span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// CurrencyCombobox: Popover+Command combobox for currency selection
const CurrencyCombobox: React.FC<{
  prefs: any;
  setPrefs: (p: any) => void;
  allCurrencies: { code: string; name: string }[];
}> = ({ prefs, setPrefs, allCurrencies }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedCurrency = allCurrencies.find((c) => c.code === prefs.currency);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-full justify-between min-w-0"
          onClick={() => setOpen(true)}
        >
          <span
            className="truncate block max-w-full"
            title={
              selectedCurrency
                ? `${selectedCurrency.name} (${selectedCurrency.code})`
                : "Select currency..."
            }
          >
            {selectedCurrency
              ? `${selectedCurrency.name} (${selectedCurrency.code})`
              : "Select currency..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 border-slate-800"
        align="start"
      >
        <Command className="bg-slate-900">
          <CommandInput
            placeholder="Search currency..."
            className="h-9"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="bg-slate-900">
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {allCurrencies
                .filter((c) =>
                  `${c.name} ${c.code}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((c) => (
                  <CommandItem
                    key={c.code}
                    value={`${c.code}`}
                    onSelect={() => {
                      setPrefs((prev: any) => ({ ...prev, currency: c.code }));
                      setOpen(false);
                    }}
                    className="truncate max-w-full bg-slate-900 text-slate-200 hover:bg-slate-800"
                  >
                    <Check
                      className={
                        "mr-2 h-4 w-4 " +
                        (prefs.currency === c.code
                          ? "opacity-100"
                          : "opacity-0")
                      }
                    />
                    {c.name} ({c.code})
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SettingsPage;
