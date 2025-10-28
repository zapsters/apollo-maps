"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import L, { Draggable } from "leaflet";
import type { MarkerType } from "./types";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const LeafletMap = dynamic(() => import("./components/LeafletMap"), { ssr: false });

export default function MapPage({
  defaultLayout = [100, 50],
}: {
  defaultLayout: number[] | undefined;
}) {
  // Used by react-resizable-panels to persist between loads.
  const onLayout = (sizes: number[]) => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
  };

  const [map, setMap] = useState<L.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
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
      <PanelGroup
        id="aside-panelGroup"
        // autoSaveId={"aside-panelGroup"} Uncomment to make size persistent
        direction="vertical"
        onLayout={onLayout}
        style={{ width: 300 }}>
        <Panel id="markers-panel" defaultSize={defaultLayout[0]} className="panel markers">
          <h1>Markers</h1>
          <hr />
          <ul className="markers">
            {markers.map((marker, i) => (
              <li
                key={i}
                className={selectedMarker == i ? "active" : ""}
                onClick={(e) => {
                  map?.flyTo(marker.position, 13);
                  setSelectedMarker(i);

                  // If the user clicked on our actual li and not another item, change our focus away.
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
                      updateMarker(i, "draggable", !marker.draggable);
                    }}>
                    <img
                      className="lockButton"
                      src={marker.draggable ? "pixelLockUnlocked.svg" : "pixelLock.svg"}
                      alt="X"
                    />
                  </button>
                  <button
                    onClick={(e) => {
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
        </Panel>
        <PanelResizeHandle className="elem_resize_handle" />
        <Panel id="addMarkers-panel" defaultSize={defaultLayout[1]} className="panel addMarker">
          <h1>Add marker</h1>
          <hr />
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </Panel>
      </PanelGroup>

      <LeafletMap
        markers={markers}
        onMarkerMove={(i, pos) => updateMarker(i, "position", pos)}
        updateMarker={updateMarker}
        updateSelectedMarker={setSelectedMarker}
        setMap={setMap}
      />
    </main>
  );
}
