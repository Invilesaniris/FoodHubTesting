import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MyLocation from "@material-ui/icons/MyLocation";
import LocationOn from "@material-ui/icons/LocationOn";
import SearchIcon from "@material-ui/icons/Search";
import axios from "axios";
import { fetchRestaurantsByAddress } from "../redux/actions/dataActions";

const useStyles = makeStyles((theme) => ({
  rootHome: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: 860,
  },
  rootItems: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: 400,
    backgroundColor: "#edebeb",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    position: "relative",
  },
  results: {
    position: "absolute",
    bottom: -166,
    left: "26%",
    zIndex: 999,
    width: 760,
    height: "15%",
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

export default function SearchBar(props) {
  const classes = useStyles();
  const [address, setAddress] = useState(localStorage.getItem("location") || "");
  const page = props.page;
  const dispatch = useDispatch();

  const [suggestions, setSuggestions] = useState([]); // State cho gợi ý địa chỉ
  const [loading, setLoading] = useState(false); // State cho trạng thái tải

  const getBrowserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        getUserAddressBy(position.coords.latitude, position.coords.longitude);
      },
      function (error) {
        alert("The Locator was denied, Please add your address manually");
      }
    );
  };

  const handleSelect = async (value) => {
    if (value === "") localStorage.removeItem("location");
    else localStorage.setItem("location", value);
    setAddress(value);
    setSuggestions([]); // Ẩn danh sách gợi ý sau khi chọn
    const latlng = await getLatLngFromGoong(value); // Lấy tọa độ từ Goong API
    if (latlng) localStorage.setItem("latlng", `${latlng.lat}, ${latlng.lng}`);
    fetchRestByLocation(latlng);
  };

  const fetchRestByLocation = (latlng) => {
    dispatch(fetchRestaurantsByAddress(latlng.lat, latlng.lng));
    props.action(true);
  };

  const handleSearch = (event) => {
    props.handleSearch(event.target.value);
  };

  const getUserAddressBy = (lat, long) => {
    const latlng = {
      lat: lat,
      lng: long,
    };
    axios
      .get(
        `https://rsapi.goong.io/Geocode?latlng=${lat},${long}&api_key=${process.env.REACT_APP_GOONG_API_KEY}`
      )
      .then((result) => {
        console.log(result.data);
        if (result.data.results[0]?.formatted_address === "")
          localStorage.removeItem("location");
        else
          localStorage.setItem(
            "location",
            result.data.results[0].formatted_address
          );
        setAddress(result.data.results[0].formatted_address);
        fetchRestByLocation(latlng);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Hàm lấy latlng từ Goong API dựa trên địa chỉ
  const getLatLngFromGoong = async (address) => {
    try {
      const response = await axios.get(
        `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(address)}&api_key=${process.env.REACT_APP_GOONG_API_KEY}`
      );
      const results = response.data.results;
      if (results.length > 0) {
        return results[0].geometry.location;
      }
      return null;
    } catch (error) {
      console.error("Error fetching latlng from Goong:", error);
      return null;
    }
  };

  // Hàm lấy gợi ý địa chỉ từ Goong API
  const fetchSuggestions = async (input) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `https://rsapi.goong.io/Place/Autocomplete?api_key=${process.env.REACT_APP_GOONG_API_KEY}&input=${encodeURIComponent(input)}&location=21.0285,105.8542`
      );
      setSuggestions(response.data.predictions || []);
    } catch (error) {
      console.error("Error fetching suggestions from Goong API:", error);
      setSuggestions([]);
    }
    setLoading(false);
  };

  // Xử lý khi người dùng nhập hoặc thay đổi giá trị
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setAddress(newValue); // Cập nhật state address
    fetchSuggestions(newValue); // Lấy gợi ý dựa trên giá trị mới
  };

  return (
    <Paper
      component="form"
      className={page !== "items" ? classes.rootHome : classes.rootItems}
    >
      {page === "home" && <LocationOn className={classes.iconButton} />}
      {page === "items" && (
        <InputBase
          className={classes.input}
          placeholder="Search Items"
          onChange={handleSearch}
          inputProps={{ "aria-label": "search for items" }}
        />
      )}
      {page === "home" && (
        <>
          <InputBase
            value={address}
            onChange={handleInputChange}
            placeholder="Enter delivery address"
            className={classes.input}
            inputProps={{
              "aria-label": "search goong maps for delivery address",
            }}
          />
          {loading && <div>Loading...</div>}
          {suggestions.length > 0 && (
            <div className={classes.results}>
              {suggestions.map((suggestion, index) => {
                const style = suggestion.active
                  ? { backgroundColor: "#41b6e6", cursor: "pointer" }
                  : { backgroundColor: "#fff", cursor: "pointer" };
                return (
                  <div
                    key={index}
                    onClick={() => handleSelect(suggestion.description)}
                    style={style}
                  >
                    {suggestion.description}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      <SearchIcon className={classes.iconButton} />
      {page === "home" && (
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