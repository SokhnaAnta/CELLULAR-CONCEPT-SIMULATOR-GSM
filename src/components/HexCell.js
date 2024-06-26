import React from 'react';
import { Hexagon } from 'react-hexgrid';
import './HexCell.css';

const HexCell = ({ q, r, s, color, baseCluster }) => (
  <Hexagon
    q={q}
    r={r}
    s={s}
    className={`cell cell-${color}${baseCluster ? ' base-cluster' : ''}`}
  >
    <text x="0" y="0.3" fontSize="0.3" textAnchor="middle" fill="#000">
      {color === 'black' ? '' : color}
    </text>
  </Hexagon>
);

export default HexCell;
