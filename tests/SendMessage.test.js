import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Chat from '../src/screens/Tabs/ChatStack/Chat'; 
import { firestore } from '../../../utils/firebase';
import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';

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

describe('Chat Component', () => {
  it('should send a message to a liked profile', async () => {
    const chatPartner = 'likedProfileId'; // Simulate a liked profile
    const { getByPlaceholderText, getByText, getByTestId } = render(
      <Chat route={{ params: { profile: chatPartner } }} />
    );

    // Simulate entering a message
    const input = getByPlaceholderText('Type a message');
    fireEvent.changeText(input, 'Hello there!');

    // Mock image picker functionality
    jest.spyOn(Chat.prototype, 'uploadImage').mockResolvedValue(null); // Mock image upload

    // Simulate pressing the send button
    const sendButton = getByText('Send');
    fireEvent.press(sendButton);

    // Verify that addDoc is called to send the message
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(), // Collection reference
        expect.objectContaining({
          text: 'Hello there!',
          imageUrl: null,
          sender: 'testuser',
          timestamp: expect.any(Date),
        })
      );
    });
  });
});