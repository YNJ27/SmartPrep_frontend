const fs = require('fs');
let svg = fs.readFileSync('public/scroll.svg', 'utf8');
svg = svg.replace('<?xml version="1.0" encoding="UTF-8"?>\n', '');
svg = svg.replace('xmlns="http://www.w3.org/2000/svg"', 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"');
svg = svg.replace(/fill="#000000"/g, 'fill="currentColor"');
const lines = svg.split('\n');
let path1 = '';
let path2 = '';
lines.forEach(line => {
  if (line.includes('<path') && line.includes('244.89')) {
    path1 = line;
  }
  if (line.includes('<path') && line.includes('267.375')) {
    path2 = line;
  }
});

let newSvg = `<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  ${path1}
  <g className="scroll-wheel">
    ${path2.replace('transform="translate(267.375,111.125)"', '')}
  </g>
</svg>`;

const componentCode = `import React from 'react';

export default function ScrollIcon({ className }) {
  return (
    ${newSvg}
  );
}
`;

fs.writeFileSync('src/components/ScrollIcon.jsx', componentCode);
console.log('Done');
