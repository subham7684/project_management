import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Token, User } from "../../types/interfaces";
import authService from "../../services/auth";

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk<
  Token, // expecting a Token object
  { email: string; password: string },
  { rejectValue: string }
>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      // authService.login now returns a Token (flat object)
      const data: Token = await authService.login(credentials.email, credentials.password);
      console.log("Auth Result in Slice", JSON.stringify(data));
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to Login");
    }
  }
);

export const register = createAsyncThunk<
  User,
  { email: string; full_name?: string; phone?: string; password: string; role?: string },
  { rejectValue: string }
>(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const user = await authService.register(data);
      return user;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to Register");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<Token>) => {
        state.loading = false;
        // Store the token from the Token object
        state.token = action.payload.access_token;
        localStorage.setItem("token", action.payload.access_token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login error";
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration error";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
