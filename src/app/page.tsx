'use client';
import { useEffect } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { format, fromUnixTime, parseISO } from "date-fns";
import { useAtom } from "jotai";
import { placeAtom, loadingCityAtom } from "./atom";
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import Navbar from "@/components/Navbar";
import { metersToKilometers } from "@/utils/metersToKilometers";
import { convertWindSpeed } from "@/utils/convertWindSpeed";

interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    visibility: number;
  };
  weather: {
    id: number;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
}

interface WeatherData {
  list: WeatherDetail[];
  city: {
    name: string;
    sunrise: number;
    sunset: number;
  };
}

export default function Home() {
  const [place] = useAtom(placeAtom);
  const [loadingCity] = useAtom(loadingCityAtom);

  const { isLoading, error, data, refetch } = useQuery<WeatherData>(
    "repoData",
    async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=40`
      );
      return data;
    }
  );

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  if (isLoading)
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Please Wait Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center min-h-screen justify-center">
        {/* @ts-ignore */}
        <p className="text-red-400">{error.message}</p>
      </div>
    );

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    ),
  ];

  const firstDataForEachDate = uniqueDates.slice(0, 5).map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      return entryDate === date;
    });
  });

  return (
    <div
      className="flex flex-col gap-4 min-h-screen"
      style={{
        backgroundImage:
          'url("https://images.pexels.com/photos/531756/pexels-photo-531756.jpeg?auto=compress&cs=tinysrgb&w=800")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4 bg-transparent">
        {loadingCity ? (
          <WeatherSkeleton />
        ) : (
          <>
            <section className="space-y-4 ">
              <div className="space-y-2">{/* Today's weather */}</div>
            </section>

            <section className="flex w-full flex-col gap-4 bg-transparent">
              <p className="text-2xl text-white">Forecast (5 days)</p>
              {firstDataForEachDate.map((d, i) => (
                <ForecastWeatherDetail
                  key={i}
                  className="text-white" 
                  description={d?.weather[0].description ?? ""}
                  weatherIcon={d?.weather[0].icon ?? ""}
                  date={d ? format(parseISO(d.dt_txt), "dd.MM") : ""}
                  day={d ? format(parseISO(d.dt_txt), "EEEE") : ""}
                  feels_like={d?.main.feels_like ?? 0}
                  temp={d?.main.temp ?? 0}
                  temp_max={d?.main.temp_max ?? 0}
                  temp_min={d?.main.temp_min ?? 0}
                  airPressure={`${d?.main.pressure} hPa `}
                  humidity={`${d?.main.humidity}% `}
                  sunrise={format(
                    fromUnixTime(data?.city.sunrise ?? 0),
                    "H:mm"
                  )}
                  sunset={format(fromUnixTime(data?.city.sunset ?? 0), "H:mm")}
                  visibility={`${metersToKilometers(
                    d?.main.visibility ?? 0
                  )} km`}
                  windSpeed={`${convertWindSpeed(d?.wind.speed ?? 0)} km/h`}
                />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function WeatherSkeleton() {
  return <section className="space-y-8">{/* Today's data skeleton */}</section>;
}
