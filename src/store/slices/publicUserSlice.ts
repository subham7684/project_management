import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/interfaces';
import PublicUserService from '../../services/publicUser';

interface PublicUserState {
  userList: User[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

const initialState: PublicUserState = {
  userList: [],
  loading: false,
  error: null,
  loaded: false
};

export const fetchPublicUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>(
  'publicUsers/fetchPublicUsers',
  async (_, { rejectWithValue }) => {
    try {
      const users = await PublicUserService.fetchPublicUsers();
      return users;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch public users');
    }
  }
);

const publicUserSlice = createSlice({
  name: 'publicUsers',
  initialState,
  reducers: {
    clearPublicUserErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.userList = action.payload;
        state.loaded = true;
      })
      .addCase(fetchPublicUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching public users';
        state.loaded = false;
      });
  }
});

export const { clearPublicUserErrors } = publicUserSlice.actions;
export default publicUserSlice.reducer;