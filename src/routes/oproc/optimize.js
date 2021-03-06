import intersects from 'robust-segment-intersect';

export function score (nodes, lanes) {
  var sum = 0;

  var nodesById = {};
  var coordsUsed = {};
  for (const node of nodes) {
    nodesById[node.id] = node;

    // "Allocate" some space
    const coord = `${Math.floor(node.x / 2)},${Math.floor(node.y / 2)}`;
    if (coordsUsed[coord]) {
      sum += 1000;
    } else {
      coordsUsed[coord] = true;
    }
  }

  var polylines = [];
  for (const lane of lanes) {
    let polyline = [];
    let prevNodeId;
    for (const nodeId of lane.nodes) {
      if (prevNodeId) {
        const node = nodesById[nodeId];
        const prevNode = nodesById[prevNodeId];
        const x1 = prevNode.x;
        const y1 = prevNode.y;
        const x2 = node.x;
        const y2 = node.y;
        polyline.push([[x1, y1], [x2, y2]]);
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        // console.log({dx,dy});

        // if (x1 < x2) {
        //   // Try to have right increase to right
        //   sum += 10 * (x2 - x1);
        // }

        if (dy < 0.01) {
          // Straight horizontal lines
          const dist = dx + dy;
          if (dist < 1) {
            sum += 10;
          } else {
            sum += dist / 10;
          }
        } else if (dx < 0.01) {
          // Straight vertical lines
          const dist = dx + dy;
          if (dist < 1) {
            sum += 20;
          } else {
            sum += dist / 2;
          }
        // } else if (Math.abs(dx - dy) < 0.01) {
        //   // 45° angle
        //   const dist = Math.sqrt(Math.pow(dx, 2), Math.pow(dy, 2));
        //   if (dist < 2) {
        //     sum += Math.pow((2 - dist), 2);
        //   } else {
        //     sum += Math.pow((dist - 2) / 10, 2);
        //   }
        } else {
          // Skewed line
          sum += (2 + dx) * (2 + dy);
        }

        for (const node of nodes) {
          const { x, y } = node;
          if (node.id !== nodeId &&
              node.id !== prevNodeId &&
              x1 - 0.5 > x && y1 - 0.5 > y &&
              x2 + 0.5 < x && y2 + 0.5 < y) {
            // Link occludes unrelated node
            sum += 30;
          }
        }
      }
      prevNodeId = nodeId;
    }
    polylines.push({ lane: lane.id, polyline });
  }

  // Find line intersections
  for (const polyline1 of polylines) {
    for (const polyline2 of polylines) {
      let i = 0;
      for (const line1 of polyline1.polyline) {
        let j = 0;
        for (const line2 of polyline2.polyline) {
          if ((polyline1.lane !== polyline2.lane || i !== j) &&
              intersects(line1[0], line1[1], line2[0], line2[1])) {
            sum += 10;
          }
          j++;
        }
        i++;
      }
    }
  }

  return 100000 / (1 + sum);
}

export function mutate (nodes, mutations) {
  var mutated = nodes.map(node => ({ ...node }));
  for (let n = 0; n < mutations; n++) {
    const i = Math.floor(nodes.length * Math.random());
    var node = mutated[i];
    node.x += (Math.ceil(20 * Math.random()) - 10) / 2;
    node.y += (Math.ceil(20 * Math.random()) - 10) / 2;
  }
  return mutated;
}
