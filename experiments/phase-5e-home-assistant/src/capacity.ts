import { applySnapshot, applyStateChanged, createIntegrationState } from './model.ts';
import type {
  HomeAssistantBinding,
  HomeAssistantIntegrationState,
  HomeAssistantState,
  HomeAssistantStateChangedEvent,
} from './types.ts';

export interface CapacityFixture {
  readonly bindings: readonly HomeAssistantBinding[];
  readonly snapshot: readonly HomeAssistantState[];
  readonly events: readonly HomeAssistantStateChangedEvent[];
}

const entityCount = 100;
const cycleCount = 10;
const baseTime = Date.parse('2026-08-31T12:00:00.000Z');

function timestamp(milliseconds: number): string {
  return new Date(baseTime + milliseconds).toISOString();
}

function entityId(index: number): string {
  return `sensor.wayglass_capacity_${index.toString().padStart(3, '0')}`;
}

function providerState(index: number, value: string, milliseconds: number): HomeAssistantState {
  const at = timestamp(milliseconds);
  return Object.freeze({
    entity_id: entityId(index),
    state: value,
    attributes: Object.freeze({ sequence: milliseconds }),
    last_changed: at,
    last_updated: at,
  });
}

function event(
  index: number,
  next: HomeAssistantState | null,
  milliseconds: number,
): HomeAssistantStateChangedEvent {
  return Object.freeze({
    event_type: 'state_changed',
    time_fired: timestamp(milliseconds),
    data: Object.freeze({ entity_id: entityId(index), old_state: null, new_state: next }),
  });
}

export function createCapacityFixture(): CapacityFixture {
  const bindings = Object.freeze(
    Array.from({ length: entityCount }, (_, index) =>
      Object.freeze({
        key: `capacity-${index.toString().padStart(3, '0')}`,
        entityId: entityId(index),
      }),
    ),
  );
  const snapshot = Object.freeze(
    Array.from({ length: entityCount }, (_, index) => providerState(index, 'initial', index)),
  );
  const events: HomeAssistantStateChangedEvent[] = [];

  for (let cycle = 0; cycle < cycleCount; cycle += 1) {
    for (let index = 0; index < entityCount; index += 1) {
      const orderedAt = 1_000 + cycle * 1_000 + index;
      if (cycle === 2) {
        events.push(event(index, providerState(index, 'ordered-1', 2_000 + index), orderedAt));
      } else if (cycle === 3) {
        events.push(event(index, providerState(index, 'older', 1_500 + index), orderedAt));
      } else if (cycle === 4) {
        events.push(event(index, providerState(index, 'unknown', orderedAt), orderedAt));
      } else if (cycle === 5) {
        events.push(event(index, providerState(index, 'unavailable', orderedAt), orderedAt));
      } else if (cycle === 7) {
        events.push(event(index, null, orderedAt));
      } else if (cycle === 9) {
        events.push(event(index, providerState(index, `final-${index}`, orderedAt), orderedAt));
      } else {
        events.push(event(index, providerState(index, `ordered-${cycle}`, orderedAt), orderedAt));
      }
    }
  }

  return Object.freeze({ bindings, snapshot, events: Object.freeze(events) });
}

export function runCapacityFixture(fixture: CapacityFixture): HomeAssistantIntegrationState {
  let state = applySnapshot(createIntegrationState(fixture.bindings), fixture.snapshot);
  for (const update of fixture.events) state = applyStateChanged(state, update);
  return state;
}

export function assertCapacityResult(state: HomeAssistantIntegrationState): void {
  if (state.connection !== 'connected' || Object.keys(state.entities).length !== entityCount) {
    throw new Error('P5E_HA_CAPACITY_SHAPE: capacity result has the wrong shape');
  }
  for (let index = 0; index < entityCount; index += 1) {
    const record = state.entities[`capacity-${index.toString().padStart(3, '0')}`];
    if (record?.reportedValue !== `final-${index}` || record.knowledge !== 'confirmed') {
      throw new Error(`P5E_HA_CAPACITY_RESULT: entity ${index} has incorrect final semantics`);
    }
  }
}
