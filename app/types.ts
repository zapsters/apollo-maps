import { LatLngExpression } from "leaflet";

export interface MarkerType {
    title: string;
    description?: string;
    position: LatLngExpression;
    draggable: boolean;
    ref?: L.Marker;
    dragging?: boolean;
}
