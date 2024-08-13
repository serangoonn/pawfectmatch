import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateUserProfile from '../src/screens/CreateUserProfile';
import { useNavigation } from '@react-navigation/core';
import { getAuth, updateProfile } from 'firebase/auth';
import { setDoc, getDocs } from 'firebase/firestore';
import { uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage';

// Mock the necessary modules
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
  it('allows input of user profile details and saves the profile', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<CreateUserProfile />);

    // Mock user input
    fireEvent.changeText(getByPlaceholderText('Enter username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Enter experience level'), 'beginner');
    fireEvent.changeText(getByPlaceholderText('Enter breed preference'), 'Labrador');

    // Select location
    fireEvent.press(getByText('Select a location'));
    fireEvent.press(getByText('North Region'));

    // Select animal type
    fireEvent.press(getByText('Select an Animal Type'));
    fireEvent.press(getByText('Dog'));

    // Select characteristics
    fireEvent.press(getByText('Select characteristics'));
    fireEvent.press(getByText('active'));

    // Mock image pick
    const mockImage = { assets: [{ uri: 'test-image-uri' }] };
    require('expo-image-picker').launchImageLibraryAsync.mockResolvedValue(mockImage);
    fireEvent.press(getByText('Pick an image'));

    // Mock firestore and storage operations
    getDocs.mockResolvedValueOnce({
      docs: [{ data: () => ({ username: 'existinguser' }) }],
    });
    setDoc.mockResolvedValueOnce();
    uploadBytesResumable.mockResolvedValueOnce();
    getDownloadURL.mockResolvedValueOnce('test-image-url');

    // Submit the form
    fireEvent.press(getByText('Save profile'));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          uid: 'test-uid',
          username: 'testuser',
          experiencelevel: 'beginner',
          location: 'North Region',
          animal: 'Dog',
          breed: 'Labrador',
          fixedCharacteristics: ['active'],
          imageUrl: 'test-image-url',
        })
      );
      expect(updateProfile).toHaveBeenCalledWith(expect.anything(), {
        displayName: 'testuser',
        photoURL: 'test-image-url',
      });
    });
  });
});