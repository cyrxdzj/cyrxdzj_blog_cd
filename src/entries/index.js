import React from 'react';
import ReactDOM from 'react-dom/client';
import yaml from 'js-yaml';
import IndexPage from '../pages/index';
import indexYamlStr from '../data/index.yaml';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<IndexPage index_yaml={yaml.load(indexYamlStr)} />);
