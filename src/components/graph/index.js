import { h, Component } from 'preact';
import Node from './node';
import Path from './path';
import { flatten } from '../../lib/util';

const LANE_SIZE = 6;
const LANE_SPACING = 2;

const NS_SVG = 'http://www.w3.org/2000/svg';
const NS_XHTML = 'http://www.w3.org/1999/xhtml';

export default class Graph extends Component {
  constructor () {
    super();

    this.setState({
      dragging: false,
      panX: 0,
      panY: 500,
      zoom: 1
    });
  }

  onMouseDown = e => {
    if (e.button === 0) {
      console.log('onMouseDown', e);
      this.setState({
        dragging: true
      });
    }
  }

  onMouseMove = e => {
    if (this.state.dragging) {
      e.preventDefault();

      const { zoom } = this.state;
      const dx = e.movementX * zoom;
      const dy = e.movementY * zoom;
      console.log('move', dx, dy, 'zoom', zoom);
      console.log('move', dx, dy);
      this.setState({
        panX: this.state.panX + dx,
        panY: this.state.panY + dy
      });
    }
  }

  onMouseUp = e => {
    if (e.button === 0) {
      this.setState({
        dragging: false
      });
    }
  }

  onMouseLeave = e => {
    this.setState({
      dragging: false
    });
  }

  onMousewheel = e => {
    if (e.deltaY !== 0) {
      e.preventDefault();

      var { zoom, panX, panY } = this.state;
      const mouseX = (e.offsetX - panX) / zoom;
      const mouseY = (e.offsetY - panY) / zoom;
      if (e.deltaY < 0) {
        zoom *= Math.pow(1.0005, -e.deltaY);
      } else {
        zoom *= Math.pow(0.9995, e.deltaY);
      }
      panX = e.offsetX - mouseX * zoom;
      panY = e.offsetY - mouseY * zoom;
      this.setState({
        zoom,
        panX,
        panY
      });
    }
  }

  getChildContext () {
    const { panX, panY, zoom } = this.state;
    const mapX = (x) => zoom * x + panX;
    const mapY = (y) => zoom * y + panY;
    return { mapX, mapY, zoom };
  }

  render () {
    const { nodes, lanes } = this.props;
    console.log('render props', this.props);
    var nodeById = {};
    var nodeIns = {};
    var nodeOuts = {};
    for (const node of nodes) {
      nodeById[node.id] = node;
      nodeIns[node.id] = {};
      nodeOuts[node.id] = {};
    }
    for (const lane of lanes) {
      var nodeIndex = 0;
      for (const id of lane.nodes) {
        if (nodeIndex > 0) {
          nodeIns[id][lane.id] = true;
        }
        nodeIndex++;
        if (nodeIndex < lane.nodes.length) {
          nodeOuts[id][lane.id] = true;
        }
      }
    }
    for (const id in nodeIns) {
      nodeIns[id] = Object.keys(nodeIns[id]);
    }
    // console.log('nodeIns', nodeIns);
    for (const id in nodeOuts) {
      nodeOuts[id] = Object.keys(nodeOuts[id]);
    }
    // console.log('nodeOuts', nodeOuts);

    const mapX = x => x * 80;
    const mapY = y => y * 80;
    var links = lanes.map(lane => ({
      path: flatten(lane.nodes.map(id => {
        const node = nodeById[id];
        const ins = nodeIns[id];
        const inIndex = ins.indexOf(lane.id);
        const y1 = inIndex < 0 ? null : LANE_SPACING / 2 + (LANE_SIZE + LANE_SPACING) * (inIndex - (ins.length - 1) / 2);
        const outs = nodeOuts[id];
        const outIndex = outs.indexOf(lane.id);
        const y2 = outIndex < 0 ? null : LANE_SPACING / 2 + (LANE_SIZE + LANE_SPACING) * (outIndex - (outs.length - 1) / 2);
        console.log('ins:', inIndex, ins.length, 'outs:', outIndex, outs.length, 'y:', y1, y2);

        if (y1 === y2 || y2  === null) {
          return [{
            x: mapX(node.x),
            y: mapY(node.y) + y1,
          }];
        } else if (typeof y1 === null) {
          return [{
            x: mapX(node.x),
            y: mapY(node.y) + y2,
          }];
        } else {
          return [{
            x: mapX(node.x),
            y: mapY(node.y) + y1,
          }, {
            x: mapX(node.x),
            y: mapY(node.y) + y2,
          }];
        }
      })),
      ...lane
    }));
    console.log('links', links);

    return (
      <svg xmlns={NS_SVG} version='1.1'
        viewBox='0 0 640 480' preserveAspectRatio='xMidYMid slice'
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseLeave}
        onMousewheel={this.onMousewheel}
        >

        {links.map(link => <Path path={link.path} size={LANE_SIZE} color={link.color} />)}
        {nodes.map(node => <Node x={mapX(node.x)} y={mapY(node.y)} size={24} shape='circle' label={node.title || ''} labelRotation={60} />)}

      </svg>
    );
  }
}
