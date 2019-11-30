import React from 'react';

import { Champion } from '../knowledge/modeldata';
import { encodeStr } from '../loader/mapsToGraph';

interface ChampionImagesProps {
  champions: Champion[];
}

// helper component for svg
export function ChampionImages(props: ChampionImagesProps) {
  const {champions} = props;
  return (
    <>
      {champions.map(c => (
        <pattern
          key={c.name}
          id={encodeStr(c.name)+'-img'}
          patternUnits="objectBoundingBox"
          width="1"
          height="1"
          x="0"
          y="0"
        >
          <image
            className="node-icon"
            href={c.icon}
            x="0"
            y="0"
          />
        </pattern>
      ))}
    </>
  );
}
