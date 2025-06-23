import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountrySelect } from "@/components/ui/CountrySelect";

const LOCALE_KEY = "user_country";
const LOCALE_CONSENT_KEY = "user_country_consent";

interface LocaleContextType {
  country: string | null;
  setCountry: (country: string) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  country: null,
  setCountry: () => {},
});

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [country, setCountryState] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerCountry, setBannerCountry] = useState<string>("IN");

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_KEY);
    const consent = localStorage.getItem(LOCALE_CONSENT_KEY);
    if (stored) {
      setCountryState(stored);
      setShowBanner(false);
    } else {
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          const guessed =
            data && data.country ? data.country.toUpperCase() : "IN";
          setBannerCountry(guessed);
          setCountryState(guessed);
          localStorage.setItem(LOCALE_KEY, guessed);
        })
        .catch(() => {
          setBannerCountry("IN");
          setCountryState("IN");
          localStorage.setItem(LOCALE_KEY, "IN");
        });
      if (!consent) {
        setShowBanner(true);
      }
    }
  }, []);

  const setCountry = (country: string) => {
    setCountryState(country);
    localStorage.setItem(LOCALE_KEY, country);
    localStorage.setItem(LOCALE_CONSENT_KEY, "true");
    setShowBanner(false);
  };

  const handleBannerAccept = () => {
    setCountry(bannerCountry);
    setShowBanner(false);
  };

  const handleBannerCancel = () => {
    setShowBanner(false);
  };

  return (
    <LocaleContext.Provider value={{ country, setCountry }}>
      {children}
      {showBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/70">
          <Card className="w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-800 bg-slate-900 mx-2">
            <CardContent className="p-8 flex flex-col gap-6">
              <div className="text-center max-w-lg mx-auto">
                <p className="text-lg font-medium text-slate-300 mb-2">
                  Pick your country to get accurate local details.
                </p>
                <div className="text-xs text-slate-300 mb-2">
                  To personalize your experience, we use your country to
                  automatically set your currency, date, and number formats.
                </div>
              </div>
              <CountrySelect
                value={bannerCountry}
                onChange={setBannerCountry}
                showCurrent={true}
              />
              <div className="flex gap-3 justify-end w-full mt-2">
                <Button onClick={handleBannerAccept} className="bg-indigo-500">
                  Save
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300"
                  onClick={handleBannerCancel}
                >
                  I'll do it later
                </Button>
              </div>
              <div className="text-xs text-slate-500 text-center mt-2">
                You can always change your country later from{" "}
                <b>Avatar → Settings → Country</b>.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </LocaleContext.Provider>
  );
};
