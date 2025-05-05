import { ElevatorState } from '../types/types';

export class ElevatorFactory {
    static createElevator(id: number, initialFloor: number = 0): ElevatorState {
        return {
            id,
            currentFloor: initialFloor,
            targetFloor: null,
            isMoving: false,
            pendingFloors: []
        };
    }

    static createElevators(count: number): ElevatorState[] {
        return Array.from({ length: count }, (_, index) =>
            this.createElevator(index)
        );
    }
}