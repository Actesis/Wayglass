import { proofIconCatalog } from '../src/catalog.js';
import { generateIconArtifacts } from '../src/generator.js';

const artifacts = generateIconArtifacts(proofIconCatalog);
const bytes = Object.values(artifacts).reduce(
  (total, artifact) => total + Buffer.byteLength(artifact),
  0,
);
process.stdout.write(String(bytes));
