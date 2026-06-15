import React from 'react';
import ReactDOM from 'react-dom/client';
import yaml from 'js-yaml';
import CyrxdzjBlogIndex from '../pages/index';
import indexYamlStr from '../data/index.yaml';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CyrxdzjBlogIndex index_yaml={yaml.load(indexYamlStr)} />);
