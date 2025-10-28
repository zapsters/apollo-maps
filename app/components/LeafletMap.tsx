"use client";

import { Dispatch, Ref, SetStateAction, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L, { Draggable, Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapEvents } from "react-leaflet";
import { MarkerType } from "../types";
import DOMPurify from "dompurify"; // Used to prevent XSS by purifying our Marker data.

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const iconSize = 30;

async function generateColoredIcon(color: string) {
  const res = await fetch("/pixelHouse2.svg");
  let svg = await res.text();
  svg = svg.replace(/fill="[^"]*"/g, `fill="${color}"`);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  return URL.createObjectURL(blob);
}

export default function LeafletMap({
  markers,
  onMarkerMove,
  setMap,
  updateMarker,
  updateSelectedMarker,
}: {
  markers: MarkerType[];
  onMarkerMove: (index: number, newPosition: L.LatLngExpression) => void;
  setMap: Ref<Map>;
  updateMarker: Function;
  updateSelectedMarker: Function;
}) {
  const [iconUrl, setIconUrl] = useState<string>("");
  const [color, setColor] = useState("#FF008A");

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        // setState your coords here
        // coords exist in "e.latlng.lat" and "e.latlng.lng"
        console.log(e.latlng.lat, e.latlng.lng);
        updateSelectedMarker(-1);
      },
    });
    return null;
  };

  useEffect(() => {
    generateColoredIcon(color).then(setIconUrl);
  }, [color]);

  return (
    <div className="map">
      <MapContainer
        center={[39.80888219469297, -85.92199623584753]}
        zoom={13}
        ref={setMap}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" noWrap />
        <MapEvents />
        {markers.map((marker: MarkerType, i: number) => (
          <Marker
            key={i}
            keyboard
            title={marker.title}
            riseOnHover
            autoPanOnFocus
            ref={(m) => m && marker.ref == undefined && updateMarker(i, "ref", m)}
            icon={L.icon({
              iconUrl,
              iconSize: [iconSize, iconSize],
              iconAnchor: [iconSize / 2, iconSize / 2],
              popupAnchor: [0, iconSize / -2],
            })}
            draggable={marker.draggable}
            bubblingMouseEvents={false}
            position={marker.position}
            eventHandlers={{
              add: (e) => {
                updateMarker(i, "ref", e.target);
              },
              dragstart: (e) => {
                marker.dragging = true;
              },
              dragend: (e) => {
                marker.dragging = false;
                const latLng = e.target.getLatLng();
                onMarkerMove(i, [latLng.lat, latLng.lng] as [number, number]);
              },
              click: (e) => {
                console.log(marker.dragging);
                updateSelectedMarker(i);
              },
            }}>
            <Popup closeButton={false}>
              <h3 style={{ marginBottom: 5, textAlign: "center" }}>{marker.title}</h3>
              {marker.description && (
                <p
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      marker.description
                        ? marker.description
                            .replace(/^([\w\s]+?): /gm, "<b>$1: </b>")
                            .replace(/\n/g, "<br>")
                        : ""
                    ),
                  }}
                  style={{ margin: 0 }}
                />
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
