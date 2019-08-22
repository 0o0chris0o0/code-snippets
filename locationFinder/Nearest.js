import React from 'react';

import Location from './Location';

export default class Nearest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: []
    };
  }

  render() {
    const { locations } = this.props;

    const locationElems = locations.map(location => (
      <Location key={location.name} locationData={location} />
    ));

    return (
      <div className="grid-x grid-margin-x">
        <div className="cell">
          <ul className="locations__nearest__list">
            {locations.length && locationElems.slice(0, 3)}
          </ul>
        </div>
      </div>
    );
  }
}
