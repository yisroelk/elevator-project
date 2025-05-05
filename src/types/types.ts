export interface ElevatorState {
    id: number;
    currentFloor: number;
    targetFloor: number | null;
    isMoving: boolean;
    pendingFloors: number[];  // Queue of floors to visit
}

export interface BuildingConfig {
    id: number;
    numFloors: number;
    numElevators: number;
}

export interface FloorCallRequest {
    floorNumber: number;
    timestamp: number;
    buildingId: number;
}

export interface ElevatorSystem {
    initialize(config: BuildingConfig): void;
    handleFloorCall(request: FloorCallRequest): void;
    getElevatorStates(): ElevatorState[];
}