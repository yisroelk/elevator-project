import React, { useEffect, useRef } from "react";
import { ElevatorState } from "../types/types";
import elvImage from "../assets/images/elv.png";

interface ElevatorProps {
  state: ElevatorState;
  floorHeight: number;
  onMovementComplete?: () => void;
}

export const Elevator: React.FC<ElevatorProps> = ({
  state,
  floorHeight,
  onMovementComplete,
}) => {
  const elevatorRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef<number>(state.currentFloor);

  useEffect(() => {
    if (!elevatorRef.current || state.targetFloor === null) return;

    const element = elevatorRef.current;
    const floorsToTravel = Math.abs(state.targetFloor - state.currentFloor);
    const duration = floorsToTravel * 0.5; // 0.5 seconds per floor
    const newPosition = state.targetFloor * floorHeight;

    // Set dynamic transition duration based on distance
    element.style.transition = `transform ${duration}s linear`;
    element.style.transform = `translateY(-${newPosition}px)`;

    const handleTransitionEnd = () => {
      // Update currentFloor in the state
      if (state.targetFloor !== null) {
        lastPosition.current = state.targetFloor;
      }
      onMovementComplete?.();
    };

    element.addEventListener("transitionend", handleTransitionEnd);
    return () => {
      element.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [state.targetFloor, floorHeight, onMovementComplete]);

  return (
    <div
      ref={elevatorRef}
      style={{
        position: "absolute",
        bottom: 0,
        width: "60px",
        height: "100px",
        backgroundImage: `url(${elvImage})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        transform: `translateY(-${state.currentFloor * floorHeight}px)`,
        willChange: "transform",
      }}
    />
  );
};
