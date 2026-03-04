/**
 * useGeolocation.ts
 * Design: Dark Gaming Gauge - Geolocation hook
 * Watches user position and calculates distance from ideal location
 */

import { useState, useEffect, useCallback } from "react";

export interface GeoState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isWatching: boolean;
  permissionStatus: "unknown" | "granted" | "denied" | "prompt";
}

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGeolocation(onDistanceUpdate?: (km: number) => void) {
  const [geoState, setGeoState] = useState<GeoState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isWatching: false,
    permissionStatus: "unknown",
  });

  const [watchId, setWatchId] = useState<number | null>(null);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoState((prev) => ({
        ...prev,
        error: "このブラウザはGeolocationをサポートしていません",
      }));
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGeoState({
          latitude,
          longitude,
          accuracy,
          error: null,
          isWatching: true,
          permissionStatus: "granted",
        });

        // Calculate distance from a demo "ideal" location (Tokyo Station)
        // In production, this would use the scheduled location
        const idealLat = 35.6812;
        const idealLon = 139.7671;
        const dist = haversineDistance(latitude, longitude, idealLat, idealLon);
        onDistanceUpdate?.(Math.min(dist, 50)); // cap at 50km
      },
      (error) => {
        const messages: Record<number, string> = {
          1: "位置情報へのアクセスが拒否されました",
          2: "位置情報を取得できませんでした",
          3: "位置情報の取得がタイムアウトしました",
        };
        setGeoState((prev) => ({
          ...prev,
          error: messages[error.code] || "不明なエラー",
          isWatching: false,
          permissionStatus: error.code === 1 ? "denied" : "unknown",
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    setWatchId(id);
    setGeoState((prev) => ({ ...prev, isWatching: true }));
  }, [onDistanceUpdate]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setGeoState((prev) => ({ ...prev, isWatching: false }));
    }
  }, [watchId]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return { geoState, startWatching, stopWatching };
}
