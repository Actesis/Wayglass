export interface TabsExampleView {
  readonly value: string;
  readonly label: string;
  readonly summary: string;
  readonly heading: string;
  readonly description: string;
  readonly facts: readonly {
    readonly label: string;
    readonly value: string;
  }[];
}

export const tabsExampleViews: readonly TabsExampleView[] = [
  {
    value: 'overview',
    label: 'Overview',
    summary: '3 active workstreams',
    heading: 'Workspace overview',
    description:
      'A stable summary keeps the most useful workspace context available without implying operational condition.',
    facts: [
      { label: 'Active workstreams', value: '3' },
      { label: 'Next review', value: '14:30' },
    ],
  },
  {
    value: 'activity',
    label: 'Activity',
    summary: 'Updated 2 minutes ago',
    heading: 'Recent activity',
    description:
      'Activity remains a peer view. Selecting it changes composition state, not domain value or health.',
    facts: [
      { label: 'Changes today', value: '8' },
      { label: 'Last editor', value: 'Jordan Lee' },
    ],
  },
  {
    value: 'access',
    label: 'Access',
    summary: '1 invitation pending',
    heading: 'Workspace access',
    description:
      'Pending invitation information remains visible in the selector summary while another panel is selected.',
    facts: [
      { label: 'Members', value: '12' },
      { label: 'Pending invitations', value: '1' },
    ],
  },
];
