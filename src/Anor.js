// DEPRICATED V2
import React, { useState } from 'react';
import { Graph } from 'react-d3-graph';

import { objFromAry } from './util';
import { keys, id, defaultConfig } from './config';
import * as dataModule from './data/champions.json';
import { mapsToD3Graph } from './loader/mapsToGraph';
import { jsonToMaps } from './loader/dataToMaps';
import './App.css';

// DATA
const champions = Object.values(dataModule.default).map(c => ({ ...c, active: true }));
console.log(window.champions = champions);
const idToChampion = objFromAry(id, champions);

const keyToMap = jsonToMaps(champions);
console.log(window.keyToMap = keyToMap);

// map of vals to keys (uniques vals)
const valToKey = champions.reduce((vals, c) => {
  keys.forEach(k => c[k].forEach(v => vals[v] = k));
  return vals;
}, {});
console.log(window.valToKey = valToKey);


function useConfig(defaultConfig) {
  const [config, setConfig] = useState(defaultConfig);

  const ConfigEditor = (
    <div id="config-editor">
    </div>
  );

  return [config, ConfigEditor];
}

// all keys must exist to be considered a leaf
function isLeaf(obj) {
  return keys.reduce((acc, key) => acc && Boolean(obj[key]), true);
}

function objsCheckboxOnChange(e) {
  const { value, checked } = e.target;
  debugger;
  idToChampion[value].active = checked;
}

function LabeledCheckbox({label, checked, onChange, className, children}) {
  return (
    <div className={className}>
      <input
        id={label + '_input'}
        type="checkbox"
        value={label}
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={label}>{label}</label>
      {children}
    </div>
  );
}

class ObjectCheckbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { checked: props.object.active };
  }

  onChange = e => {
    // side effect
    this.props.object.active = e.target.checked;
    this.setState({ checked: e.target.checked });
  }

  render() {
    const { name } = this.props.object;
    const { checked } = this.state;
    return (
       <LabeledCheckbox
        key={name}
        label={name}
        checked={checked}
        onChange={this.onChange}
        className="container"
      />
    );
  }
}

function renderObjAsCheckbox(obj) {
  const { name, active } = obj;
  return (
    <div key={name} className="container">
      <input
        id={name}
        type="checkbox"
        value={name}
        checked={active}
        onChange={objsCheckboxOnChange}
      />
      <label htmlFor={name}>{name}</label>
    </div>
  );
}

// walk an js object tree
function walkLeaves(cb, isLeaf, tree) {
  if (isLeaf(tree)) {
    cb(tree);
  } else {
    Object.values(tree).forEach(child => walkLeaves(cb, isLeaf, child));
  }
}

class MapAsCheckboxes extends React.Component {
  state = { checked: true };

  constructor(props) {
    super(props);
  }

  render() {
    return '';
  }
}

// return render: list of inputs
function renderMapAsCheckboxes(name, map) {
  function mapCheckboxOnChange(e) {
    const { value, checked } = e.target;
    debugger;
    walkLeaves(obj => obj.active = checked, isLeaf, map[value]);
  }

  const { render, checked } = Object.entries(map[name]).reduce((acc, [k, v]) => {
    if (isLeaf(v)) {
      // acc.render.push(renderObjAsCheckbox(v));
      acc.render.push(<ObjectCheckbox object={v} />)
      acc.checked = acc.checked && v.active;
    } else {
      const { render, checked } = renderMapAsCheckboxes(k, map[name]);
      acc.render.push(render);
      acc.checked = acc.checked && checked;
    }
    return acc;
  }, { render: [], checked: true });

  return {
    render: (
      <LabeledCheckbox
        key={name}
        label={name}
        checked={checked}
        onChange={mapCheckboxOnChange}
        className="container"
      >
        {render}
      </LabeledCheckbox>
    ),
    checked,
  };
}

// interface treeprop = { render: , prop1: , prop2: , ... }
// creates check boxes with objects at leaves, based on a maps of props vals -> objs
function renderMapsAsCheckboxes(keyToMap) {
  const checkboxes = Object.entries(keyToMap).map(([key, valMap]) => {
    const { render, checked } = renderMapAsCheckboxes(key, keyToMap);
    return render;
  });

  return (
    <div className="checkboxes">
      {checkboxes}
    </div>
  );
}

// try constructing inside first, then build outer
function Anor() {
  const [config, ConfigEditor] = useConfig(defaultConfig);

  const [selection, setSelection] = useState([]);

  const filtered = objFromAry(id, champions.filter(c => !c.active));
  const graph = mapsToD3Graph(id, champions, filtered, Object.values(keyToMap));
  return (
    <div className="app" style={{height: '100vh', width: '100vw'}}>
      {ConfigEditor}
      {renderMapsAsCheckboxes(keyToMap)}
      <Graph id="graph" data={graph} config={config} />
    </div>
  );
}

export default Anor;