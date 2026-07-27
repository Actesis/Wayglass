import { LitElement } from 'lit';

/**
 * Shared base for Wayglass elements.
 *
 * Domain state does not belong here. Components opt into only the presentation
 * and local interaction state they need.
 */
export abstract class WayglassElement extends LitElement {}
