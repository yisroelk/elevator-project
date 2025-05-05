import React from "react";
import { BuildingConfig } from "../types/types";
import "../assets/help.css";
import "../assets/main.css";

interface BuildingProps {
  config: BuildingConfig;
  onFloorCall: (floorNumber: number) => void;
  activeFloors: Set<number>;
}

const FLOOR_HEIGHT = 110;
const BLACK_LINE_HEIGHT = 7;

export const Building: React.FC<BuildingProps> = ({
  config,
  onFloorCall,
  activeFloors,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: "400px",
        height: `${config.numFloors * FLOOR_HEIGHT}px`,
        border: "1px solid #333",
        overflow: "hidden",
      }}
    >
      {/* Floors */}
      {Array.from({ length: config.numFloors }, (_, index) => {
        const floorNumber = config.numFloors - 1 - index;
        return (
          <div
            key={floorNumber}
            style={{
              position: "absolute",
              top: `${index * FLOOR_HEIGHT}px`,
              width: "100%",
              height: `${FLOOR_HEIGHT}px`,
            }}
          >
            {/* Floor background */}
            <div
              className="floor"
              style={{
                height: `${FLOOR_HEIGHT - BLACK_LINE_HEIGHT}px`,
              }}
            >
              {/* Floor call button */}
              <button
                className={`metal linear ${
                  activeFloors.has(floorNumber) ? "active" : ""
                }`}
                onClick={() => onFloorCall(floorNumber)}
              >
                {floorNumber}
              </button>
            </div>
            {/* Black line */}
            <div
              style={{
                height: `${BLACK_LINE_HEIGHT}px`,
                backgroundColor: "#000000",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
