import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Chat from '../src/screens/Tabs/ChatStack/Chat'; // Update the import path
import { firestore } from '../../../utils/firebase';
import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

// Mock Firebase functions
jest.mock('../../../utils/firebase', () => ({
  firestore: {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    onSnapshot: jest.fn(),
    addDoc: jest.fn(),
  },
  storage: {
    ref: jest.fn(),
  },
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockReturnValue({
    currentUser: {
      displayName: 'testuser',
      photoURL: 'http://example.com/photo.jpg',
    },
  }),
}));

jest.mock('@react-navigation/core', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

describe('Chat Component', () => {
  it('should send media to the profile they are chatting with', async () => {
    const chatPartner = 'likedProfileId'; // Simulate a liked profile
    const mockImageUri = 'http://example.com/image.jpg'; // Simulated image URI

    // Mock ImagePicker to return a predefined image URI
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      cancelled: false,
      assets: [{ uri: mockImageUri }],
    });

    // Mock Firebase functions
    const mockUploadImage = jest.fn().mockResolvedValue(mockImageUri);
    Chat.prototype.uploadImage = mockUploadImage;

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <Chat route={{ params: { profile: chatPartner } }} />
    );

    // Simulate selecting an image
    const attachButton = getByTestId('imagePickerIcon'); // Make sure to add testID in your component
    fireEvent.press(attachButton);

    // Wait for image picker to return
    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });

    // Simulate entering a message and sending
    const input = getByPlaceholderText('Type a message');
    fireEvent.changeText(input, 'Check this out!');
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    // Verify that addDoc is called with the expected parameters
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(), // Collection reference
        expect.objectContaining({
          text: 'Check this out!',
          imageUrl: mockImageUri,
          sender: 'testuser',
          timestamp: expect.any(Date),
        })
      );
    });
  });
});