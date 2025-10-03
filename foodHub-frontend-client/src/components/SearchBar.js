import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import LocationOn from '@material-ui/icons/LocationOn';
import SearchIcon from '@material-ui/icons/Search';
import MyLocation from '@material-ui/icons/MyLocation';
import axios from 'axios';

// Goong API endpoints
const GOONG_API_KEY = process.env.REACT_APP_GOONG_API_KEY;
const AUTOCOMPLETE_ENDPOINT = 'https://rsapi.goong.io/Place/Autocomplete';
const GEOCODE_ENDPOINT = 'https://rsapi.goong.io/Geocode';

// Giả định makeStyles từ mã gốc
const useStyles = makeStyles((theme) => ({
  rootHome: {
    display: 'flex',
    alignItems: 'center',
    width: '90%',
    margin: 'auto',
    padding: '2px 4px',
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
    ['@media (max-width:1024px)']: { // Giữ responsive như HomeStart
      flexDirection: 'column',
    },
  },
  rootItems: {
    display: 'flex',
    alignItems: 'center',
    width: '90%',
    margin: 'auto',
    padding: '2px 4px',
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    fontSize: 16,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
  results: {
    position: 'absolute',
    zIndex: 1000,
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: 4,
    width: '300px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
}));

// Component autocomplete với Goong API
function GoongLocationSearchInput({ value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = async (inputValue) => {
    onChange(inputValue); // Cập nhật address state từ parent
    if (inputValue.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${AUTOCOMPLETE_ENDPOINT}?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(inputValue)}&location=21.0285,105.8542`
      );
      const data = await response.json();
      setSuggestions(data.predictions || []);
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
    setLoading(false);
  };

  const handleSelect = async (description, placeId) => {
    onChange(description); // Cập nhật input với description
    setSuggestions([]); // Ẩn dropdown
    try {
      const response = await fetch(`${GEOCODE_ENDPOINT}?place_id=${placeId}&api_key=${GOONG_API_KEY}`);
      const data = await response.json();
      const latLng = data.results[0]?.geometry?.location;
      onSelect({ description, latLng }); // Truyền lên parent
      console.log('Success:', latLng);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <InputBase
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Enter delivery address"
        className="location-search-input"
        inputProps={{ 'aria-label': 'search for delivery address' }}
      />
      <div className="autocomplete-dropdown-container">
        {loading && <div>Loading...</div>}
        {suggestions.map((suggestion, index) => {
          const style = suggestion.active
            ? { backgroundColor: '#41b6e6', cursor: 'pointer' }
            : { backgroundColor: '#fff', cursor: 'pointer' };
          return (
            <div
              key={index}
              onClick={() => handleSelect(suggestion.description, suggestion.place_id)}
              style={style}
              className="suggestion-item"
            >
              {suggestion.description}
            </div>
          );
        })}
      </div>
    </>
  );
}

// Component chính (giữ gần giống HomeStart và mã gốc)
function SearchBar({ page, handleSearch, getBrowserLocation, fetchRestByLocation }) {
  const classes = useStyles();
  const [address, setAddress] = useState('');

  // Reverse geocoding với Goong API
  const getUserAddressBy = (lat, lng) => {
    const latlng = { lat, lng };
    axios
      .get(
        `${GEOCODE_ENDPOINT}?address=${lat},${lng}&api_key=${GOONG_API_KEY}`
      )
      .then((result) => {
        console.log(result.data);
        const formattedAddress = result.data.results[0]?.formatted_address || '';
        if (formattedAddress === '') {
          localStorage.removeItem('location');
        } else {
          localStorage.setItem('location', formattedAddress);
        }
        setAddress(formattedAddress);
        fetchRestByLocation(latlng);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Handle select từ autocomplete
  const handleSelect = (selected) => {
    setAddress(selected.description); // Cập nhật input
    // Có thể lưu latLng vào localStorage hoặc state nếu cần
    localStorage.setItem('location', selected.description);
  };

  return (
    <Paper
      component="form"
      className={page !== 'items' ? classes.rootHome : classes.rootItems}
    >
      {page === 'home' && <LocationOn className={classes.iconButton} />}

      {page === 'items' && (
        <InputBase
          className={classes.input}
          placeholder="Search Items"
          onChange={handleSearch}
          inputProps={{ 'aria-label': 'search for items' }}
        />
      )}

      {page === 'home' && (
        <GoongLocationSearchInput
          value={address}
          onChange={setAddress}
          onSelect={handleSelect}
        />
      )}

      <SearchIcon className={classes.iconButton} />

      {page === 'home' && (
        <>
          <Divider className={classes.divider} orientation="vertical" />
          <IconButton
            color="primary"
            className={classes.iconButton}
            aria-label="directions"
            onClick={getBrowserLocation}
          >
            <MyLocation />
          </IconButton>
        </>
      )}
    </Paper>
  );
}

export default React.memo(SearchBar);