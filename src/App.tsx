import { useState } from "react";
import "./App.css";
import { Building } from "./components/Building";
import { ElevatorBank } from "./components/ElevatorBank";
import { BuildingConfig } from "./types/types";

function App() {
  // Default configuration for a single building
  const [buildings] = useState<BuildingConfig[]>([
    {
      id: 1,
      numFloors: 15,
      numElevators: 3,
    },
  ]);

  const [activeFloors, setActiveFloors] = useState<Set<number>>(new Set());
  const [elevatorPositions, setElevatorPositions] = useState<Set<number>>(
    new Set()
  );

  const handleFloorCall = (floorNumber: number) => {
    // Don't add if already active or if an elevator is already there
    if (!activeFloors.has(floorNumber) && !elevatorPositions.has(floorNumber)) {
      setActiveFloors((prev) => new Set(prev).add(floorNumber));
    }
  };

  const handleElevatorMove = (
    floorNumber: number,
    currentFloor: number | null
  ) => {
    setActiveFloors((prev) => {
      const next = new Set(prev);
      next.delete(floorNumber);
      return next;
    });

    setElevatorPositions((prev) => {
      const next = new Set(prev);
      // Remove the elevator from its previous position if it had one
      if (currentFloor !== null) {
        next.delete(currentFloor);
      }
      // Add the elevator to its new position
      next.add(floorNumber);
      return next;
    });
  };

  // When an elevator leaves a floor
  const handleElevatorLeave = (floorNumber: number) => {
    setElevatorPositions((prev) => {
      const next = new Set(prev);
      next.delete(floorNumber);
      return next;
    });
  };

  return (
    <div className="app">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "20px",
        }}
      >
        {buildings.map((buildingConfig) => (
          <div key={buildingConfig.id} style={{ display: "flex" }}>
            <Building
              config={buildingConfig}
              onFloorCall={handleFloorCall}
              activeFloors={activeFloors}
            />
            <ElevatorBank
              config={buildingConfig}
              onElevatorMove={handleElevatorMove}
              onElevatorLeave={handleElevatorLeave}
              activeFloors={activeFloors}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
