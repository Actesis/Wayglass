import type { RichVisualizationInput } from './model.js';

function element<K extends keyof HTMLElementTagNameMap>(
  name: K,
  text?: string,
): HTMLElementTagNameMap[K] {
  const result = document.createElement(name);
  if (text !== undefined) result.textContent = text;
  return result;
}

export function mountApplicationEquivalence(
  container: HTMLElement,
  input: RichVisualizationInput,
): () => void {
  const region = element('section');
  region.className = 'p5c-equivalence';
  region.setAttribute('aria-labelledby', `${input.id}-evidence-heading`);

  const heading = element('h2', 'Readable investigation evidence');
  heading.id = `${input.id}-evidence-heading`;
  region.append(heading, element('p', input.summary));

  const details = element('details');
  details.className = 'p5c-exact-table';
  details.append(element('summary', 'Inspect all exact queue observations'));
  const tableHost = element('div');
  tableHost.className = 'p5c-table-scroll';
  tableHost.tabIndex = 0;
  tableHost.setAttribute('role', 'region');
  tableHost.setAttribute('aria-label', 'Exact queue observations');
  details.append(tableHost);

  let tableMounted = false;
  const mountTable = () => {
    if (tableMounted || !details.open) return;
    tableMounted = true;

    const table = element('table');
    const caption = element(
      'caption',
      `${input.title}. ${input.threshold.label}: ${input.threshold.formattedValue}. ${input.annotation.label}: ${input.annotation.formattedObservedAt}. ${input.annotation.detail}`,
    );
    const head = element('thead');
    const headRow = element('tr');
    headRow.append(element('th', 'Observed at'));
    for (const series of input.series) headRow.append(element('th', series.label));
    head.append(headRow);

    const body = element('tbody');
    const sampleCount = input.series[0]!.points.length;
    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
      const row = element('tr');
      const firstPoint = input.series[0]!.points[sampleIndex]!;
      const timeCell = element('th', firstPoint.formattedObservedAt);
      timeCell.scope = 'row';
      row.append(timeCell);
      for (const series of input.series) {
        const point = series.points[sampleIndex]!;
        row.append(element('td', `${point.formattedValue}; knowledge: ${point.knowledge}`));
      }
      body.append(row);
    }
    table.append(caption, head, body);
    tableHost.append(table);
  };

  details.addEventListener('toggle', mountTable);
  region.append(details);
  container.append(region);

  return () => region.remove();
}
