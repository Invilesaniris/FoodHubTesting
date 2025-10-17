// file: redux_counter.js

const { createStore } = require("redux");

// ===================================
// 1. ACTION TYPES (Các Hằng số)
// Định nghĩa các loại hành động mà ứng dụng có thể thực hiện
// ===================================
const INCREMENT = "INCREMENT";
const DECREMENT = "DECREMENT";
const ADD_BY = "ADD_BY";

// ===================================
// 2. REDUCER (Bộ giảm tốc)
// Hàm thuần túy quyết định cách State thay đổi dựa trên Action
// ===================================
const initialState = {
  count: 0,
};

function counterReducer(state = initialState, action) {
  // Reducer luôn tạo bản sao (bất biến) của state
  switch (action.type) {
    case INCREMENT:
      return {
        ...state,
        count: state.count + 1, // Thay đổi thuộc tính 'count'
      };
    case DECREMENT:
      return {
        ...state,
        count: state.count - 1,
      };
    case ADD_BY:
      return {
        ...state,
        count: state.count + action.payload, // Sử dụng dữ liệu kèm theo (payload)
      };
    default:
      return state; // Luôn trả về state hiện tại nếu action không khớp
  }
}

// ===================================
// 3. STORE (Kho lưu trữ)
// Nơi chứa state toàn cục và đăng ký Reducer
// ===================================
const store = createStore(counterReducer);

// ===================================
// 4. SUBSCRIPTION (Đăng ký)
// Hàm này sẽ chạy MỖI KHI state trong Store thay đổi
// ===================================
store.subscribe(() => {
  console.log("--- State thay đổi ---");
  console.log("Trạng thái hiện tại:", store.getState());
  console.log("------------------------");
});

// ===================================
// 5. DISPATCHING ACTIONS (Gửi hành động)
// Cách duy nhất để thay đổi state là gửi (dispatch) một Action
// ===================================

console.log("Trạng thái ban đầu:", store.getState());
// 

// Hành động 1: Tăng 1
store.dispatch({ type: INCREMENT });
// Output: count: 1

// Hành động 2: Tăng 1 lần nữa
store.dispatch({ type: INCREMENT });
// Output: count: 2

// Hành động 3: Giảm 1
store.dispatch({ type: DECREMENT });
// Output: count: 1

// Hành động 4: Tăng thêm 10 (sử dụng dữ liệu payload)
store.dispatch({
  type: ADD_BY,
  payload: 10,
});
// Output: count: 11