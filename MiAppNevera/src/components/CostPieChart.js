import React from 'react';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

export default function CostPieChart({ data, size = 180, innerRadius = 60, background }) {
  const radius = size / 2;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let acc = 0;
  return (
    <Svg width={size} height={size}>
      {data.map(d => {
        const start = (acc / total) * 2 * Math.PI;
        const end = ((acc + d.value) / total) * 2 * Math.PI;
        const large = end - start > Math.PI ? 1 : 0;
        const x1 = radius + radius * Math.sin(start);
        const y1 = radius - radius * Math.cos(start);
        const x2 = radius + radius * Math.sin(end);
        const y2 = radius - radius * Math.cos(end);
        const path = `M${radius} ${radius} L${x1} ${y1} A${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
        const mid = (start + end) / 2;
        const tx = radius + (radius * 0.6) * Math.sin(mid);
        const ty = radius - (radius * 0.6) * Math.cos(mid);
        const pct = total ? (d.value / total) * 100 : 0;
        acc += d.value;
        return (
          <React.Fragment key={d.key}>
            <Path d={path} fill={d.color} />
            {pct >= 5 && (
              <SvgText
                x={tx}
                y={ty}
                fill="#fff"
                fontSize={14}
                fontWeight="700"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {`${pct.toFixed(0)}%`}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}
      {innerRadius > 0 && (
        <Circle cx={radius} cy={radius} r={innerRadius} fill={background || '#fff'} />
      )}
    </Svg>
  );
}
