import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import App from './App';

const render = cmsContent => {
  ReactDOM.render(<App cmsContent={cmsContent} />, document.getElementById('app'));
};

const fetchCmsContent = () => {
  return new Promise(resolve => {
    axios.get(`${process.env.API_URL}content?entry=locations`).then(response => {
      const cmsContent = response.data.data[0];
      resolve(cmsContent);
    });
  });
};

// begin fetching cms content from directus and then render app
fetchCmsContent().then(response => {
  render(response);
});
