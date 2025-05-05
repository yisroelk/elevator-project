import React, { useState, useEffect, useRef } from "react";
import { Elevator } from "./Elevator";
import { BuildingConfig, ElevatorState } from "../types/types";
import { ElevatorFactory } from "../factories/ElevatorFactory";
import dingSound from "../assets/sounds/ding.mp3";

interface ElevatorBankProps {
  config: BuildingConfig;
  onElevatorMove: (floorNumber: number, currentFloor: number | null) => void;
  onElevatorLeave: (floorNumber: number) => void;
  activeFloors: Set<number>;
}

const FLOOR_HEIGHT = 110;
const ELEVATOR_WAIT_TIME = 2000;
const TIME_PER_FLOOR = 500;

export const ElevatorBank: React.FC<ElevatorBankProps> = ({
  config,
  onElevatorMove,
  onElevatorLeave,
  activeFloors,
}) => {
  const [elevators, setElevators] = useState<ElevatorState[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const assignedFloors = useRef<Set<number>>(new Set());

  useEffect(() => {
    const initialElevators = ElevatorFactory.createElevators(
      config.numElevators
    );
    setElevators(initialElevators);
    audioRef.current = new Audio(dingSound);
  }, [config.numElevators]);

  const calculateArrivalTime = (
    elevator: ElevatorState,
    targetFloor: number
  ): number => {
    if (!elevator.isMoving) {
      return Math.abs(elevator.currentFloor - targetFloor) * TIME_PER_FLOOR;
    }

    let totalTime = 0;
    let currentPosition = elevator.currentFloor;

    if (elevator.targetFloor !== null) {
      totalTime +=
        Math.abs(currentPosition - elevator.targetFloor) * TIME_PER_FLOOR +
        ELEVATOR_WAIT_TIME;
      currentPosition = elevator.targetFloor;
    }

    for (const floor of elevator.pendingFloors) {
      totalTime +=
        Math.abs(currentPosition - floor) * TIME_PER_FLOOR + ELEVATOR_WAIT_TIME;
      currentPosition = floor;
    }

    totalTime += Math.abs(currentPosition - targetFloor) * TIME_PER_FLOOR;

    return totalTime;
  };

  const isFloorAlreadyAssigned = (targetFloor: number): boolean => {
    return elevators.some(
      (elevator) =>
        elevator.targetFloor === targetFloor ||
        elevator.pendingFloors.includes(targetFloor)
    );
  };

  const findOptimalElevator = (targetFloor: number): ElevatorState | null => {
    if (isFloorAlreadyAssigned(targetFloor)) {
      return null;
    }

    let selectedElevator = elevators[0];
    let shortestTime = calculateArrivalTime(selectedElevator, targetFloor);

    elevators.forEach((elevator) => {
      const arrivalTime = calculateArrivalTime(elevator, targetFloor);
      if (arrivalTime < shortestTime) {
        shortestTime = arrivalTime;
        selectedElevator = elevator;
      }
    });

    return selectedElevator;
  };

  const moveElevator = (elevator: ElevatorState, targetFloor: number) => {
    // Notify that the elevator is leaving its current floor
    if (elevator.currentFloor !== targetFloor) {
      onElevatorLeave(elevator.currentFloor);
    }

    assignedFloors.current.add(targetFloor);
    setElevators((prevElevators) =>
      prevElevators.map((e) =>
        e.id === elevator.id
          ? {
              ...e,
              targetFloor,
              isMoving: true,
            }
          : e
      )
    );
  };

  const handleMovementComplete = (elevatorId: number) => {
    const elevator = elevators.find((e) => e.id === elevatorId);
    if (!elevator || elevator.targetFloor === null) return;

    const previousFloor = elevator.currentFloor;

    setElevators((prevElevators) =>
      prevElevators.map((e) =>
        e.id === elevatorId
          ? {
              ...e,
              currentFloor: e.targetFloor!,
            }
          : e
      )
    );

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }

    onElevatorMove(elevator.targetFloor, previousFloor);
    assignedFloors.current.delete(elevator.targetFloor);

    setTimeout(() => {
      setElevators((prevElevators) =>
        prevElevators.map((e) => {
          if (e.id !== elevatorId) return e;

          const [nextFloor, ...remainingFloors] = e.pendingFloors;

          if (nextFloor !== undefined) {
            onElevatorLeave(e.currentFloor);
            assignedFloors.current.add(nextFloor);
            return {
              ...e,
              targetFloor: nextFloor,
              pendingFloors: remainingFloors,
              isMoving: true,
            };
          }

          return {
            ...e,
            isMoving: false,
            targetFloor: null,
            pendingFloors: [],
          };
        })
      );
    }, ELEVATOR_WAIT_TIME);
  };

  useEffect(() => {
    activeFloors.forEach((floorNumber) => {
      const elevatorOnFloor = elevators.some(
        (elevator) =>
          elevator.currentFloor === floorNumber && !elevator.isMoving
      );

      if (!elevatorOnFloor && !assignedFloors.current.has(floorNumber)) {
        const optimalElevator = findOptimalElevator(floorNumber);
        if (optimalElevator) {
          if (!optimalElevator.isMoving) {
            moveElevator(optimalElevator, floorNumber);
          } else {
            assignedFloors.current.add(floorNumber);
            setElevators((prevElevators) =>
              prevElevators.map((e) =>
                e.id === optimalElevator.id
                  ? { ...e, pendingFloors: [...e.pendingFloors, floorNumber] }
                  : e
              )
            );
          }
        }
      }
    });
  }, [activeFloors]);

  return (
    <div
      style={{
        position: "relative",
        width: `${config.numElevators * 80}px`,
        height: `${config.numFloors * FLOOR_HEIGHT}px`,
        marginLeft: "20px",
      }}
    >
      {elevators.map((elevator, index) => (
        <div
          key={elevator.id}
          style={{
            position: "absolute",
            left: `${index * 80 + 10}px`,
            height: "100%",
          }}
        >
          <Elevator
            state={elevator}
            floorHeight={FLOOR_HEIGHT}
            onMovementComplete={() => handleMovementComplete(elevator.id)}
          />
        </div>
      ))}
    </div>
  );
};
