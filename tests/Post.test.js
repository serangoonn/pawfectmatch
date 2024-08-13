import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Post from '../src/screens/Tabs/SocialStack/Post';
import { auth, firestore, storage } from '../src/utils/firebase';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc } from 'firebase/firestore';

jest.mock('@react-navigation/native');
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => ({
    canceled: false,
    assets: [{ uri: 'mock-image-uri' }],
  })),
}));
jest.mock('../src/utils/firebase', () => ({
  auth: {
    currentUser: {
      displayName: 'testuser',
      photoURL: 'mock-profile-photo-url',
    },
  },
  firestore: jest.fn(),
  storage: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
}));
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(() => ({
    on: jest.fn(),
    snapshot: {
      ref: {
        getDownloadURL: jest.fn(() => 'mock-download-url'),
      },
    },
  })),
  getDownloadURL: jest.fn(() => 'mock-download-url'),
}));

describe('Post', () => {
  const mockNavigate = jest.fn();
  const mockNavigation = { navigate: mockNavigate, goBack: jest.fn() };
  useNavigation.mockReturnValue(mockNavigation);

  it('allows the user to select an image and post a caption', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<Post />);

    // Simulate image picking
    fireEvent.press(getByText('Select a picture from your gallery:'));
    await waitFor(() => expect(getByText('Select a picture from your gallery:')).toBeTruthy());

    // Simulate caption input
    const captionInput = getByPlaceholderText('Type here...');
    fireEvent.changeText(captionInput, 'This is a test caption');

    // Simulate post submission
    const postButton = getByTestId('postButton');
    fireEvent.press(postButton);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(collection(firestore, 'posts'), {
        username: 'testuser',
        imageUrl: 'mock-download-url',
        caption: 'This is a test caption',
        createdAt: expect.any(Date),
        profilephoto: 'mock-profile-photo-url',
      });
      expect(mockNavigate).toHaveBeenCalledWith('Feed');
    });
  });
});