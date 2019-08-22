import React from 'react';

export default function Location({ locationData }) {
  const { name, location, uri } = locationData;
  return (
    <li>
      <a href={uri}>
        <p className="locations__nearest__title">
          <span>{`${location} - `}</span>
          {name}
        </p>
        {locationData.distance && (
          <span className="locations__nearest__distance">{locationData.distance} Miles Away</span>
        )}
        <span className="locations__nearest__link">
          More info about the venue
          <img src="assets/img/symbols/arrow-location.svg" />
        </span>
      </a>
    </li>
  );
}
