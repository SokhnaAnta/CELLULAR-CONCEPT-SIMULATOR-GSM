import React, { useState, useEffect } from 'react';
import { HexGrid, Layout } from 'react-hexgrid';
import HexCell from './HexCell';
import './Network.css';

const Network = () => {
  const [pattern, setPattern] = useState(null);

  useEffect(() => {
    if (pattern) {
      const baseCluster = generateBaseCluster(pattern);
      const replicatedCells = replicateCluster(baseCluster, pattern);
      setCells(replicatedCells);
    } else {
      setCells(initializeCells());
    }
  }, [pattern]);

  const initializeCells = () => {
    const cells = [];
    for (let q = -10; q <= 10; q++) {
      for (let r = -10; r <= 10; r++) {
        cells.push({ q, r, s: -q - r, color: 'black', baseCluster: false });
      }
    }
    return cells;
  };
  const [cells, setCells] = useState(initializeCells());

  const handleChange = (event) => {
    const newPattern = parseInt(event.target.value, 10);
    if (!isNaN(newPattern) && newPattern >= 1) {
      setPattern(newPattern);
    } else {
      setPattern(null);
      setCells(initializeCells());
    }
  };

  const generateBaseCluster = (N) => {
    const baseCluster = [];
    const directions = [
      { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 },
      { q: -1, r: 1 }, { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }
    ];

    for (let i = 0; i < N && i < directions.length; i++) {
      baseCluster.push({ q: directions[i].q, r: directions[i].r, color: i + 1 });
    }

    return baseCluster;
  };

  const replicateCluster = (baseCluster, N) => {
    const replicatedCells = initializeCells();

    const centerQ = -9;
    const centerR = 6;
    baseCluster.forEach(baseCell => {
      const q = baseCell.q + centerQ;
      const r = baseCell.r + centerR;
      let cell = replicatedCells.find(c => c.q === q && c.r === r);
      if (cell) {
        cell.color = baseCell.color;
      }
       cell = replicatedCells.find(c => c.q === baseCell.q && c.r === baseCell.r);
       if (cell) {
        cell.baseCluster = true;
      }
    });

    
    let isComplete = false;
    while (!isComplete) {
      isComplete = true;
      replicatedCells.forEach(cell => {
        if (cell.color === 'black') {
          for (let i = 0; i <= N && isComplete; i++) {
            for (let j =-N ; j <= i && isComplete; j++) {
              if (i ** 2 + j ** 2 + i * j === N) {
                let refCell = replicatedCells.find(c => c.q === cell.q - i && c.r === cell.r - j) ;
                if (refCell && refCell.color !== 'black') {
                  cell.color = refCell.color;
                  isComplete = false;
                }
              }
            }
          }
        }
      });
    }

    // Exclure les cellules noires
    return replicatedCells.filter(cell => cell.color !== 'black');
  };

  return (
    <div className="network-container">
      <label htmlFor="pattern">Cluster Size (N):</label>
      <input
        id="pattern"
        type="number"
        value={pattern || ''}
        onChange={handleChange}
        min="1"
        max="7"
      />
      <HexGrid width={800} height={600} viewBox="-50 -50 100 100" className="hexgrid">
        <Layout size={{ x: 5, y: 5 }} flat={true} spacing={1.1} origin={{ x: 0, y: 0 }}>
          {cells.map(cell => (
            <HexCell
              key={'${cell.q}-${cell.r}'}
              q={cell.q}
              r={cell.r}
              s={cell.s}
              color={cell.color}
              baseCluster={cell.baseCluster}
            />
          ))}
        </Layout>
      </HexGrid>
    </div>
  );
};

export default Network;