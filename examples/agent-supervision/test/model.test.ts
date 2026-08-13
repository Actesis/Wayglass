import { describe, expect, it } from 'vitest';
import {
  createHarborState,
  reduceHarbor,
  selectHarborOverview,
  selectTask,
  selectTaskInvestigation,
  selectTasksRequiringDecision,
} from '../src/model.js';

describe('Harbor Lab application state', () => {
  it('keeps availability, activity, condition, evidence, confidence, and attention independent', () => {
    const state = createHarborState('stale-evidence');
    const task = selectTask(state, 'HL-317');
    expect(task).toMatchObject({
      state: 'blocked',
      condition: 'caution',
      activity: 'waiting',
      humanAttention: 'decision-required',
      evidence: { knowledge: 'stale', confidence: 'high' },
      approvalState: 'idle',
      mergeState: 'not-merged',
    });
    expect(state.agents[0]).toMatchObject({ availability: 'available', activity: 'waiting' });
  });

  it('does not fabricate values during initial loading or discard retained refresh truth', () => {
    expect(createHarborState('initial-loading').tasks).toEqual([]);
    const retained = createHarborState('retained-refresh');
    expect(retained.tasks).toHaveLength(3);
    expect(retained.presentation.execution).toMatchObject({
      dataState: 'refreshing',
      retainedData: true,
    });
  });

  it('models denial, timeout, and merge failure without changing the target branch', () => {
    for (const scenario of ['approval-denied', 'approval-timeout', 'merge-failed'] as const) {
      const state = createHarborState(scenario);
      const task = selectTask(state, 'HL-317');
      expect(task?.mergeState).toBe('not-merged');
      expect(state.approvalRequest.message).toContain('target branch remains unchanged');
    }
  });

  it('keeps pending approval separate from confirmed merge truth', () => {
    const state = reduceHarbor(createHarborState('steady'), {
      type: 'request-merge-approval',
      requestId: 'approval-1',
      taskId: 'HL-317',
      requestedAt: '2026-08-13T14:25:00-07:00',
    });
    expect(selectTask(state, 'HL-317')).toMatchObject({
      approvalState: 'pending',
      mergeState: 'not-merged',
      activity: 'pending',
    });
    expect(state.approvalRequest.message).toContain('No merge has occurred');
  });

  it('ignores a stale approval response and resolves a matching request durably', () => {
    const pending = reduceHarbor(createHarborState('steady'), {
      type: 'request-merge-approval',
      requestId: 'approval-current',
      taskId: 'HL-317',
      requestedAt: '2026-08-13T14:25:00-07:00',
    });
    expect(
      reduceHarbor(pending, {
        type: 'resolve-merge-approval',
        requestId: 'approval-stale',
        outcome: 'merged',
        completedAt: '2026-08-13T14:26:00-07:00',
      }),
    ).toBe(pending);
    const resolved = reduceHarbor(pending, {
      type: 'resolve-merge-approval',
      requestId: 'approval-current',
      outcome: 'merged',
      completedAt: '2026-08-13T14:26:00-07:00',
    });
    expect(selectTask(resolved, 'HL-317')).toMatchObject({
      state: 'completed',
      approvalState: 'granted',
      mergeState: 'merged',
    });
    expect(resolved.announcement?.message).toBe('Merge confirmed on the target branch.');
  });

  it('states the limited pause guarantee precisely', () => {
    const state = reduceHarbor(createHarborState('steady'), {
      type: 'request-pause',
      taskId: 'HL-317',
    });
    expect(state.presentation.execution.message).toContain('active tool step may finish');
    expect(selectTask(state, 'HL-317')?.activity).toBe('pending');
  });

  it('creates a new linked retry attempt without overwriting failed history', () => {
    const state = reduceHarbor(createHarborState('merge-failed'), {
      type: 'retry-task',
      taskId: 'HL-317',
      attemptId: 'attempt-hl-317-2',
    });
    expect(selectTask(state, 'HL-317')).toMatchObject({
      state: 'queued',
      attemptId: 'attempt-hl-317-2',
      previousAttemptId: 'attempt-hl-317-1',
      mergeState: 'not-merged',
    });
  });

  it('builds the exact foundation maximum and bounds inserted tool history', () => {
    let state = createHarborState('steady', 'maximum');
    expect(state.tasks).toHaveLength(60);
    expect(state.agents).toHaveLength(12);
    expect(state.toolRecords).toHaveLength(250);
    state = reduceHarbor(state, {
      type: 'receive-tool-record',
      record: {
        id: 'tool-new',
        taskId: 'HL-317',
        tool: 'Synthetic verifier',
        summary: 'New retained evidence.',
        occurredAt: '2026-08-13T14:27:00-07:00',
        knowledge: 'confirmed',
        condition: 'neutral',
      },
    });
    expect(state.toolRecords).toHaveLength(250);
    expect(state.toolRecords[0]?.id).toBe('tool-new');
    expect(selectTasksRequiringDecision(state)[0]?.id).toBe('HL-317');
  });

  it('derives overview counts without collapsing task, agent, decision, or merge meanings', () => {
    const overview = selectHarborOverview(createHarborState('steady'));
    expect(overview).toEqual({
      queuedTasks: 1,
      activeTasks: 2,
      blockedTasks: 1,
      failedTasks: 0,
      completedTasks: 0,
      availableAgents: 2,
      runningAgents: 1,
      decisionsRequired: 1,
      confirmedMerges: 0,
    });
  });

  it('derives stable investigation records, evidence age, and worker context from shared truth', () => {
    const current = selectTaskInvestigation(createHarborState('steady'), 'HL-317');
    expect(current).toMatchObject({
      evidenceAgeMinutes: 2,
      evidenceFreshness: 'current',
      assignedAgent: {
        id: 'agent-delta',
        availability: 'available',
        activity: 'waiting',
      },
    });
    expect(current?.toolRecords.map(({ id }) => id)).toEqual([
      'tool-hl-317-tests',
      'tool-hl-317-change',
      'tool-hl-317-analysis',
      'tool-hl-317-intake',
    ]);

    const stale = selectTaskInvestigation(createHarborState('stale-evidence'), 'HL-317');
    expect(stale).toMatchObject({ evidenceAgeMinutes: 10, evidenceFreshness: 'stale' });
    expect(stale?.task.mergeState).toBe('not-merged');
  });

  it('inserts a new task tool record without replacing retained investigation identity', () => {
    const previous = selectTaskInvestigation(createHarborState('steady'), 'HL-317');
    const updated = selectTaskInvestigation(createHarborState('new-tool-record'), 'HL-317');
    expect(updated?.toolRecords[0]).toMatchObject({
      id: 'tool-hl-317-policy',
      tool: 'Synthetic policy verifier',
    });
    expect(updated?.toolRecords.slice(1).map(({ id }) => id)).toEqual(
      previous?.toolRecords.map(({ id }) => id),
    );
  });
});
