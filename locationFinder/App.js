import React from 'react';
import * as Sentry from '@sentry/browser';

import { getLocationDetails } from './functions';

import Nearest from './Nearest';
import Loader from '../../Loader';
import Map from '../../../img/symbols/map.svg';

function displayError(errorMsg) {
  const errorElem = document.getElementById('postcode-error');
  errorElem.innerText = errorMsg;
}

function resetErrors() {
  const errorElem = document.getElementById('postcode-error');
  errorElem.innerText = '';
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputLength: 0,
      shortcode: undefined,
      locations: {
        status: 'idle',
        locations: null
      },
      errorMsg: ''
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.searchPostcode = this.searchPostcode.bind(this);
    this.updateInputValue = this.updateInputValue.bind(this);
  }

  componentDidMount() {
    this.updateLocationState();
  }

  updateLocationState() {
    const locationDetails = getLocationDetails();
    locationDetails
      .then(response => {
        this.setState({
          shortcode: response.shortcode,
          locations: {
            status: 'success',
            locations: response.locations
          }
        });
      })
      .catch(error => {
        Sentry.captureException(error);
        this.setState({
          shortcode: undefined,
          locations: {
            status: 'error',
            locations: null
          },
          errorMsg:
            error.code === 1
              ? 'Please enable permissions within your browser to access your location and then re-load this page. Or enter your postcode below to find your nearest course locations.'
              : 'There was a error getting your current location, please enter your postcode to find your nearest course locations.'
        });
      });
  }

  onSubmit(event) {
    event.preventDefault();
    const postcode = this.input.value;

    if (postcode) {
      this.setState(
        {
          shortcode: undefined,
          locations: {
            status: 'idle',
            locations: null
          }
        },
        () => this.searchPostcode(postcode),
      );
    }
  }

  searchPostcode(postcode) {
    const locationDetails = getLocationDetails(postcode);
    resetErrors();
    locationDetails
      .then(response => {
        if (!response.error) {
          this.setState({
            shortcode: response.shortcode,
            locations: {
              status: 'success',
              locations: response.locations
            }
          });
        } else {
          displayError(response.error);
        }
      })
      .catch(error => {
        displayError(error.message);
        this.setState({
          shortcode: undefined,
          locations: {
            status: 'error',
            locations: null
          },
          errorMsg: ''
        });
      });
  }

  updateInputValue() {
    this.setState({
      inputLength: this.input.value.length
    });
  }

  render() {
    const { cmsContent } = this.props;
    const { locations, errorMsg, shortcode, inputLength } = this.state;

    return (
      <div className="grid-x grid-margin-x">
        <div className="cell medium-6 pos-rel">
          <div
            className={`show-for-medium locations__map active-${shortcode} ${
              locations.status === 'idle' ? 'loading' : ''
            }`}>
            <div dangerouslySetInnerHTML={{ __html: Map }} />
          </div>
        </div>
        <div className="cell medium-6" id="app">
          <div className="locations__nearest">
            <h5 className="locations__nearest__heading">{cmsContent.subheading}</h5>
            {locations.status === 'success' && <Nearest locations={locations.locations} />}
            {locations.status === 'idle' && <Loader />}
            {locations.status === 'error' && (
              <div className="locations__nearest__error">
                <p>{errorMsg}</p>
              </div>
            )}
          </div>
          <strong className="locations__search__heading">SEARCH ANOTHER AREA:</strong>
          <div className="locations__search">
            <form onSubmit={this.onSubmit}>
              <span id="postcode-error" className="form__errormsg" />
              <div className="grid-x">
                <div className="cell auto">
                  <input
                    type="text"
                    ref={node => this.input = node}
                    placeholder="Enter postcode"
                    className="locations__search__postcode"
                    onChange={this.updateInputValue}
                  />
                </div>
                <div className="cell shrink">
                  <input
                    type="submit"
                    value="go"
                    className="locations__search__submit"
                    disabled={!inputLength}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
