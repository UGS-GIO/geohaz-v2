import { MapContext } from "@/context/map-provider";
import { useContext } from "react";


export function useMap() {
    const context = useContext(MapContext);
    if (context === undefined) {
        throw new Error("useMap must be used within a MapProvider");
    }
    return context;
}