"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import L, { Draggable } from "leaflet";
import type { MarkerType } from "./types";

const LeafletMap = dynamic(() => import("./components/LeafletMap"), { ssr: false });

export default function MapPage() {
  const [map, setMap] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<MarkerType[]>([
    { title: "Home", position: [39.818882, -85.921996], draggable: false },
    { title: "Home", position: [39.808882, -85.921996], draggable: false },
    { title: "b", position: [39.808882, -85.91], draggable: true },
  ]);

  // Universal marker updater
  const updateMarker = <K extends keyof MarkerType>(
    index: number,
    key: K,
    value: MarkerType[K]
  ) => {
    setMarkers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const deleteMarker = (index: number) => {
    setMarkers((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      updated.forEach((e) => (e.ref = undefined)); // Remove all refs to reset them.
      return updated;
    });
  };

  return (
    <main style={{ display: "flex" }}>
      <aside style={{ width: 300 }}>
        <span>Markers</span>
        <hr />
        <ul className="markers">
          {markers.map((marker, i) => (
            <li
              key={i}
              onClick={(e) => {
                map?.flyTo(marker.position, 13);

                // If the user clicked on our actual li and not another item, change our focus away.
                console.log(e.currentTarget, e.target);
                if (e.currentTarget == e.target) marker.ref?.getElement()?.focus();
                marker.ref?.openPopup();
              }}>
              <div className="Header">
                <input
                  type="text"
                  value={marker.title}
                  onChange={(e) => updateMarker(i, "title", e.target.value)}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    deleteMarker(i);
                  }}>
                  <img className="deleteBtn" src="close.svg" alt="X" />
                </button>
              </div>
              <span style={{ fontSize: 9 }}>
                {Array.isArray(marker.position)
                  ? marker.position
                      .filter((val): val is number => val !== undefined)
                      .map((val) => Math.round(val * 1000) / 1000)
                      .join(", ")
                  : `${Math.round(marker.position.lat * 1000) / 1000}, ${
                      Math.round(marker.position.lng * 1000) / 1000
                    }`}
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <LeafletMap
        markers={markers}
        onMarkerMove={(i, pos) => updateMarker(i, "position", pos)}
        updateMarker={updateMarker}
        setMap={setMap}
      />
    </main>
  );
}
