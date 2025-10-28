import { LatLngExpression } from "leaflet";

export interface MarkerType {
    title: string;
    position: LatLngExpression;
    draggable: boolean;
    ref?: L.Marker;
}
