import React, { useState, useEffect } from "react";
import { HexGrid, Layout } from "react-hexgrid";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import HexCell from "./HexCell";
import "leaflet/dist/leaflet.css";
import "./Network.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const LocationMarker = ({ setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
};

const Network = () => {
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const initializeCells = () => {
    const cells = [];
    for (let q = -10; q <= 10; q++) {
      for (let r = -10; r <= 10; r++) {
        cells.push({
          q,
          r,
          s: -q - r,
          color: getRandomColor(),
          baseCluster: false,
        });
      }
    }
    return cells;
  };

  const [parameters, setParameters] = useState({
    pt: 30,
    gt: 15,
    gr: 2,
    pr: -100,
    f: 900,
    hb: 30,
    hm: 1.5,
    area: "Urbain",
    model: "Hata Urbain",
    users: 5000,
    usage: 2,
    peakHours: 3,
    qosBlock: 2,
    qosDrop: 1,
    channels: 8,
    frequencyReuse: "1/7",
    numCells: 7,
    location: { lat: 14.6928, lng: -17.4467 },
  });

  const [position, setPosition] = useState({ lat: 14.6928, lng: -17.4467 });
  const [cells, setCells] = useState(initializeCells());
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setParameters((prevParams) => ({ ...prevParams, [name]: value }));

    const newPattern = parseInt(event.target.value, 10);
    if (!isNaN(newPattern) && newPattern >= 1) {
      if (isOptimalValue(newPattern)) {
        setPattern(newPattern);
      } else {
        alert("Ce n'est pas une valeur optimale !");
      }
    } else {
      setPattern(null);
      setCells(initializeCells());
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    generateCells();
    alert("Parameters submitted! Check the map for cell locations.");
  };

  const isOptimalValue = (N) => {
    for (let i = 0; i <= N; i++) {
      for (let j = -N; j <= i; j++) {
        if (i ** 2 + j ** 2 + i * j === N) {
          return true;
        }
      }
    }
    return false;
  };

  const generateBaseCluster = (N) => {
    const baseCluster = [];
    const directions = [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: -1, r: 1 },
      { q: -1, r: 0 },
      { q: 0, r: -1 },
      { q: 1, r: -1 },
    ];

    for (let i = 0; i < N && i < directions.length; i++) {
      baseCluster.push({
        q: directions[i].q,
        r: directions[i].r,
        color: getRandomColor(),
      });
    }

    return baseCluster;
  };

  const replicateCluster = (baseCluster, N) => {
    const replicatedCells = initializeCells();

    const centerQ = -9;
    const centerR = 6;
    baseCluster.forEach((baseCell) => {
      const q = baseCell.q + centerQ;
      const r = baseCell.r + centerR;
      let cell = replicatedCells.find((c) => c.q === q && c.r === r);
      if (cell) {
        cell.color = baseCell.color;
      }
      cell = replicatedCells.find(
        (c) => c.q === baseCell.q && c.r === baseCell.r
      );
      if (cell) {
        cell.baseCluster = true;
      }
    });

    let isComplete = false;
    while (!isComplete) {
      isComplete = true;
      replicatedCells.forEach((cell) => {
        if (cell.color === "black") {
          for (let i = 0; i <= N && isComplete; i++) {
            for (let j = -N; j <= i && isComplete; j++) {
              if (i ** 2 + j ** 2 + i * j === N) {
                let refCell = replicatedCells.find(
                  (c) => c.q === cell.q - i && c.r === cell.r - j
                );
                if (refCell && refCell.color !== "black") {
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
    return replicatedCells.filter((cell) => cell.color !== "black");
  };

  return (
    <div className="network-container">
      <form onSubmit={handleSubmit}>
        <label>
          Puissance de Transmission (P<sub>t</sub>):
        </label>
        <input
          type="number"
          name="pt"
          value={parameters.pt}
          onChange={handleChange}
        />
        <label>
          Gain de l'Antenne de la Station de Base (G<sub>t</sub>):
        </label>
        <input
          type="number"
          name="gt"
          value={parameters.gt}
          onChange={handleChange}
        />
        <label>
          Gain de l'Antenne de l'Utilisateur (G<sub>r</sub>):
        </label>
        <input
          type="number"
          name="gr"
          value={parameters.gr}
          onChange={handleChange}
        />
        <label>
          Sensibilité du Récepteur (P<sub>r</sub>):
        </label>
        <input
          type="number"
          name="pr"
          value={parameters.pr}
          onChange={handleChange}
        />
        <label>Fréquence de Transmission (f):</label>
        <input
          type="number"
          name="f"
          value={parameters.f}
          onChange={handleChange}
        />
        <label>
          Hauteur de l'Antenne de la Station de Base (h<sub>b</sub>):
        </label>
        <input
          type="number"
          name="hb"
          value={parameters.hb}
          onChange={handleChange}
        />
        <label>
          Hauteur de l'Antenne de l'Utilisateur (h<sub>m</sub>):
        </label>
        <input
          type="number"
          name="hm"
          value={parameters.hm}
          onChange={handleChange}
        />
        <label>Zone:</label>
        <input
          type="text"
          name="area"
          value={parameters.area}
          onChange={handleChange}
        />
        <label>Modèle de Propagation:</label>
        <input
          type="text"
          name="model"
          value={parameters.model}
          onChange={handleChange}
        />
        <label>Nombre d'Utilisateurs:</label>
        <input
          type="number"
          name="users"
          value={parameters.users}
          onChange={handleChange}
        />
        <label>Usage Moyen (min/appel/utilisateur):</label>
        <input
          type="number"
          name="usage"
          value={parameters.usage}
          onChange={handleChange}
        />
        <label>Heures de Pointe (heure/jour):</label>
        <input
          type="number"
          name="peakHours"
          value={parameters.peakHours}
          onChange={handleChange}
        />
        <label>Qualité de Service (Blocage %):</label>
        <input
          type="number"
          name="qosBlock"
          value={parameters.qosBlock}
          onChange={handleChange}
        />
        <label>Qualité de Service (Chute %):</label>
        <input
          type="number"
          name="qosDrop"
          value={parameters.qosDrop}
          onChange={handleChange}
        />
        <label>Nombre de Canaux par Cellule:</label>
        <input
          type="number"
          name="channels"
          value={parameters.channels}
          onChange={handleChange}
        />
        <label>Réutilisation de Fréquence:</label>
        <input
          type="text"
          name="frequencyReuse"
          value={parameters.frequencyReuse}
          onChange={handleChange}
        />
        <label>Nombre de Cellules:</label>
        <input
          type="number"
          name="numCells"
          value={parameters.numCells}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker setPosition={setPosition} />
        <Marker position={position}>
          <Popup>You are here</Popup>
        </Marker>
        <HexGrid
          width={800}
          height={600}
          viewBox="-50 -50 100 100"
          className="hexgrid"
        >
          <Layout
            size={{ x: 5, y: 5 }}
            flat={true}
            spacing={1.1}
            origin={{ x: 0, y: 0 }}
          >
            {cells.map((cell) => (
              <HexCell
                key={`${cell.q}-${cell.r}`}
                q={cell.q}
                r={cell.r}
                s={cell.s}
                color={cell.color}
                baseCluster={cell.baseCluster}
              />
            ))}
          </Layout>
        </HexGrid>
      </MapContainer>
    </div>
  );
};

export default Network;
