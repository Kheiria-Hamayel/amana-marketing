"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
// Replicating imports you would use for icons
import { AreaChart, DollarSign, Map, TrendingUp } from "lucide-react";
import { Navbar } from "../../src/components/ui/navbar";
import { Footer } from "../../src/components/ui/footer";

// --- TYPESCRIPT INTERFACE DEFINITION ---
interface RegionalDataPoint {
  region: string;
  revenue: number;
  spend: number;
  lat: number;
  lng: number;
}

interface LeafletBubbleMapProps {
  data: RegionalDataPoint[];
  valueKey: "revenue" | "spend";
}

// --- LEAFLET TYPESCRIPT AUGMENTATION (to allow use of window.L) ---
interface L_Layer {
  remove(): void;
  bindPopup(content: string): L_Layer;
  addTo(map: L_Map | L_Layer): L_Layer; // Update addTo signature to accept L_Layer (LayerGroup)
  clearLayers?(): void; // Add clearLayers for LayerGroup reference
}

interface L_Map {
  remove(): void;
  eachLayer(callback: (layer: any) => void): void;
  removeLayer(layer: any): void;
  invalidateSize(): void;
  setView(latLng: [number, number], zoom: number): L_Map;
}

interface L_Static {
  map(container: string | HTMLElement, options?: any): L_Map;
  tileLayer(url: string, options?: any): L_Layer;
  circleMarker(latLng: [number, number], options?: any): L_Layer;
  CircleMarker: {
    new (latLng: [number, number], options?: any): L_Layer;
  };
  layerGroup(layers?: L_Layer[]): L_Layer & { clearLayers(): void }; // Add LayerGroup factory
}

declare global {
  interface Window {
    L?: L_Static;
  }
}
// --- END LEAFLET TYPESCRIPT AUGMENTATION ---

// --- MOCK DATA ---
const MOCK_REGIONAL_DATA: RegionalDataPoint[] = [
  {
    region: "Kuwait City",
    revenue: 550000,
    spend: 22000,
    lat: 29.3759,
    lng: 47.9774,
  },
  {
    region: "Sharjah",
    revenue: 380000,
    spend: 15000,
    lat: 25.3528,
    lng: 55.4052,
  },
  {
    region: "Dubai",
    revenue: 850000,
    spend: 35000,
    lat: 25.2048,
    lng: 55.2708,
  },
  {
    region: "Abu Dhabi",
    revenue: 600000,
    spend: 25000,
    lat: 24.4539,
    lng: 54.3773,
  },
  {
    region: "Riyadh",
    revenue: 450000,
    spend: 18000,
    lat: 24.7136,
    lng: 46.6753,
  },
  {
    region: "Manama",
    revenue: 220000,
    spend: 10000,
    lat: 26.2285,
    lng: 50.586,
  },
  { region: "Doha", revenue: 400000, spend: 16000, lat: 25.2854, lng: 51.531 },
  {
    region: "Jeddah",
    revenue: 320000,
    spend: 13000,
    lat: 21.4858,
    lng: 39.1925,
  },
];

// --- Leaflet Map Component ---

const LeafletBubbleMap: React.FC<LeafletBubbleMapProps> = ({
  data,
  valueKey,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L_Map | null>(null);
  const markerGroupRef = useRef<L_Layer | null>(null);
  const isInitializingRef = useRef(false);

  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const isRevenue = valueKey === "revenue";

  /**
   * Initializes the Leaflet map only if it hasn't been done already AND the container is ready.
   * Uses requestAnimationFrame to ensure container dimensions are non-zero.
   */
  const setupMap = useCallback(() => {
    // CRITICAL SSR SAFETY CHECK: If running on server, exit immediately.
    if (typeof window === "undefined") return;

    const L = window.L; // Local variable for type safety

    // 1. Check if L is available, container is mounted, and prevent redundant calls
    if (
      typeof L === "undefined" ||
      !mapContainerRef.current ||
      mapInstanceRef.current ||
      isInitializingRef.current
    )
      return;

    // Set flag to true to prevent other calls from entering while initialization is running
    isInitializingRef.current = true;

    const container = mapContainerRef.current;

    const checkSizeAndInit = () => {
      // CRITICAL CHECK: Check if L is still available inside the async loop
      if (typeof window.L === "undefined") {
        isInitializingRef.current = false; // Stop initialization
        return;
      }

      // Check if the container has been rendered with actual width/height
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        // If not ready, try again on the next animation frame
        requestAnimationFrame(checkSizeAndInit);
        return;
      }

      try {
        // We can safely use L here because of the initial checks
        const L = window.L as L_Static;

        // CRITICAL CHECK: Check one last time before initialization
        if (mapInstanceRef.current) {
          isInitializingRef.current = false; // Reset flag if another process initialized it
          return;
        }

        const map = L.map(container, {
          center: [25.0, 48.0], // Center around GCC
          zoom: 5,
          minZoom: 4,
          maxZoom: 10,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        mapInstanceRef.current = map;

        // Using CartoDB Dark Matter tiles which do not require an API key
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 20,
          }
        ).addTo(map);

        // Initialize marker layer group
        const markerGroup = L.layerGroup();
        markerGroup.addTo(map);
        markerGroupRef.current = markerGroup;

        // Invalidate size guarantees the map calculates its view correctly
        map.invalidateSize();

        setIsLeafletLoaded(true);
      } catch (error) {
        console.error("Error initializing Leaflet map:", error);
      } finally {
        // Ensure flag is reset after initialization attempt (success or failure)
        isInitializingRef.current = false;
      }
    };

    // Start the size checking process on the next animation frame
    requestAnimationFrame(checkSizeAndInit);
  }, []); // Empty dependency array ensures a stable function reference

  // 1. Dynamic Leaflet Loading and CSS Injection
  useEffect(() => {
    // CRITICAL SSR SAFETY CHECK: If running on server, exit immediately.
    if (typeof window === "undefined") return;

    const leafletCssUrl = "https://unpkg.com/leaflet/dist/leaflet.css";
    const leafletJsUrl = "https://unpkg.com/leaflet/dist/leaflet.js";

    if (!mapContainerRef.current) return;

    // Inject CSS
    if (!document.querySelector(`link[href="${leafletCssUrl}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = leafletCssUrl;
      document.head.appendChild(link);
    }

    // Inject JS
    if (typeof window.L === "undefined") {
      const script = document.createElement("script");
      script.src = leafletJsUrl;
      // Set up map once script is loaded
      script.onload = setupMap;
      document.body.appendChild(script);
    } else {
      // If L is already defined, run setup immediately (safeguarded by checks inside setupMap)
      setupMap();
    }

    // Cleanup: Remove map instance
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        isInitializingRef.current = false;
        setIsLeafletLoaded(false);
      }
    };
  }, [setupMap]);

  // 2. Data Plotting and Metric Update Effect
  useEffect(() => {
    // CRITICAL SSR SAFETY CHECK: If running on server, exit immediately.
    if (typeof window === "undefined") return;

    const L = window.L; // Local constant for type-safe use

    // Only proceed if map is loaded and L is available, and other refs exist
    if (
      !isLeafletLoaded ||
      !mapInstanceRef.current ||
      typeof L === "undefined" ||
      !markerGroupRef.current
    )
      return;

    const markerGroup = markerGroupRef.current;

    // Clear existing markers from the LayerGroup
    (markerGroup as L_Layer & { clearLayers(): void }).clearLayers();

    const numericData: number[] = data.map((d) => d[valueKey]);
    const maxValue = Math.max(...numericData);
    const colorHex = isRevenue ? "#10B981" : "#EF4444"; // Green or Red for Revenue/Spend

    data.forEach((item) => {
      // --- Use constants for radius calculation ---
      const maxRadius = 50;
      const minRadius = 8;
      // Calculate radius dynamically (min 8, max 50)
      const radius = Math.max(
        minRadius,
        Math.round((item[valueKey] / maxValue) * maxRadius)
      );
      // ------------------------------------------

      const popupContent = `
        <div class="font-sans text-gray-900 p-1">
            <strong style="color: ${colorHex};">${item.region}</strong><br/>
            ${isRevenue ? "Revenue:" : "Spend:"} $${item[
        valueKey
      ].toLocaleString()}
        </div>
      `;

      // Use L safely here
      L.circleMarker([item.lat, item.lng], {
        radius: radius,
        color: colorHex,
        fillColor: colorHex,
        fillOpacity: 0.85,
        weight: 1.5,
      })
        .bindPopup(popupContent)
        // Add marker to the LayerGroup
        .addTo(markerGroup);
    });
  }, [data, valueKey, isRevenue, isLeafletLoaded]);

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-2xl h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
        <Map className="w-5 h-5 mr-2 text-blue-400" />
        Interactive Regional Performance: {isRevenue ? "Revenue" : "Spend"}
      </h2>
      <div
        ref={mapContainerRef}
        className="relative flex-1 rounded-lg border border-gray-700 bg-gray-900/50 overflow-hidden"
        style={{ height: "100%", minHeight: "500px", width: "100%" }}
      >
        {/* Simple Loading Indicator */}
        {!isLeafletLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white z-10 p-4">
            <svg
              className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-3 text-sm">Loading Interactive Map...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function RegionView() {
  const [metric, setMetric] = useState<"revenue" | "spend">("revenue");
  // State to track if the component has mounted on the client side
  const [hasMounted, setHasMounted] = useState(false);

  // Use effect to set hasMounted to true after the first client-side render
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleMetricChange = (newMetric: "revenue" | "spend") => {
    setMetric(newMetric);
  };

  return (
    // This top-level flex container correctly establishes the side-bar layout
    <div className="flex h-screen bg-gray-900">
      <Navbar />

      {/* Main Content Area: Takes remaining width and allows scrolling (overflow-y-auto) */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto">
        {/* Hero Section - Using the exact structure from your starter code */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">Region View</h1>
            </div>
          </div>
        </section>

        {/* Content Area - Using the exact structure from your starter code */}
        <div className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
          {/* Metric Controls */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-xl bg-gray-800 p-1 shadow-lg border border-gray-700">
              <button
                onClick={() => handleMetricChange("revenue")}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  metric === "revenue"
                    ? "bg-green-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Revenue
              </button>
              <button
                onClick={() => handleMetricChange("spend")}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  metric === "spend"
                    ? "bg-red-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                View Spend
              </button>
            </div>
          </div>

          {/* Visualization Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[600px] w-full">
              {/* Conditionally render the map only after client-side mount */}
              {hasMounted ? (
                <LeafletBubbleMap data={MOCK_REGIONAL_DATA} valueKey={metric} />
              ) : (
                <div
                  className="p-4 bg-gray-800 rounded-xl shadow-2xl h-full flex flex-col justify-center items-center"
                  style={{ minHeight: "500px" }}
                >
                  <p className="text-white">Initializing map...</p>
                </div>
              )}
            </div>

            {/* Quick Stats Panel */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 p-6 rounded-xl shadow-2xl h-full border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <AreaChart className="w-6 h-6 mr-2 text-blue-400" />
                  Regional Summary
                </h2>

                <div className="space-y-4">
                  {MOCK_REGIONAL_DATA.map((data) => (
                    <div
                      key={data.region}
                      className="bg-gray-900 p-4 rounded-lg flex justify-between items-center transition-transform duration-300 hover:scale-[1.02] border border-gray-700"
                    >
                      <p className="text-lg font-semibold text-gray-100">
                        {data.region}
                      </p>
                      <div className="text-right">
                        <p
                          className={`text-sm ${
                            metric === "revenue"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {metric === "revenue" ? "Revenue:" : "Spend:"}
                        </p>
                        <p className="text-xl font-bold text-white">
                          ${data[metric].toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
