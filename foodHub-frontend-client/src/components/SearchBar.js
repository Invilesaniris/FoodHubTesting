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
import debouncing from "../util/rateLimitting/debouncing";

const processAutoComplete = debouncing(async (input, setSuggestions) => {
  const response = await axios.get(
    `${process.env.REACT_APP_GOONG_AUTOCOMPLETE}?api_key=${
      process.env.REACT_APP_GOONG_API_KEY
    }&input=${encodeURIComponent(input)}`
  );
  setSuggestions(response.data.predictions || []);
}, 2000);

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
  const [address, setAddress] = useState(
    localStorage.getItem("location") || ""
  );
  const page = props.page;
  const dispatch = useDispatch();

  const [suggestions, setSuggestions] = useState([]); // State cho gợi ý địa chỉ
  const [loading, setLoading] = useState(false); // State cho trạng thái tải

  const handleSearch = (event) => {
    props.handleSearch(event.target.value);
  };

  // Hàm lấy gợi ý địa chỉ từ Goong API
  const fetchSuggestions = async (input) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      // const response = await axios.get(
      //   `https://rsapi.goong.io/Place/Autocomplete?api_key=${
      //     process.env.REACT_APP_GOONG_API_KEY
      //   }&input=${encodeURIComponent(input)}`
      // );
      // setSuggestions(response.data.predictions || []);
      processAutoComplete(input, setSuggestions);
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

      <SearchIcon className={classes.iconButton} />
    </Paper>
  );
}
