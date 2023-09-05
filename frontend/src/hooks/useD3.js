import React from 'react';
import * as d3 from 'd3';

export const useD3 = (renderChartFn, cleanupFn, dependencies) => {
  const ref = React.useRef();

  React.useEffect(
    () => {
      renderChartFn(d3.select(ref.current));
      return cleanupFn;
    },
    dependencies);
  return ref;
}