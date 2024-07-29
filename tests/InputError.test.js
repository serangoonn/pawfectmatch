import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateUserProfile from '../src/screens/CreateUserProfile';
import { useNavigation } from '@react-navigation/core';
import { getAuth } from 'firebase/auth';
jest.mock('@react-navigation/core', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  updateProfile: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  setDoc: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
}));
jest.mock('firebase/storage', () => ({
  uploadBytesResumable: jest.fn(),
  ref: jest.fn(),
  getDownloadURL: jest.fn(),
}));
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
};

useNavigation.mockReturnValue(mockNavigation);
const mockGetAuth = getAuth.mockReturnValue({
  currentUser: { uid: 'test-uid' },
});

describe('CreateUserProfile', () => {
  it('shows error message when required fields are empty', async () => {
    const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(<CreateUserProfile />);

    // Mock user input with empty fields
    fireEvent.changeText(getByPlaceholderText('Enter username'), '');
    fireEvent.changeText(getByPlaceholderText('Enter experience level'), '');
    fireEvent.changeText(getByPlaceholderText('Enter breed preference'), '');

    // Mock image pick to return no image
    require('expo-image-picker').launchImageLibraryAsync.mockResolvedValue({ canceled: true });

    // Submit the form with empty fields
    fireEvent.press(getByText('Save profile'));

    await waitFor(() => {
      expect(queryByText('Error: All fields must be filled.')).toBeTruthy();
    });
  });
});