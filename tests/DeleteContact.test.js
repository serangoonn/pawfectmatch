import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ContactList from '../src/screens/Tabs/ChatStack/ContactList'; // Update the import path
import { firestore } from '../../../utils/firebase';
import { getAuth } from 'firebase/auth';

// Mock Firebase functions
jest.mock('../../../utils/firebase', () => ({
  firestore: {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    updateDoc: jest.fn(),
    arrayRemove: jest.fn(),
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

describe('ContactList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a contact from the contact list', async () => {
    const mockProfiles = [
      { username: 'alice', imageUrl: 'http://example.com/alice.jpg', key: '1' },
      { username: 'bob', imageUrl: 'http://example.com/bob.jpg', key: '2' },
    ];

    // Mock Firestore function to return the mocked profiles
    firestore.collection.mockReturnValue({
      doc: jest.fn().mockReturnThis(),
      getDoc: jest.fn().mockResolvedValue({
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue({ profiles: mockProfiles }),
      }),
    });

    // Mock the delete function
    firestore.updateDoc.mockResolvedValue({});

    const { getByText, getAllByText, getByTestId } = render(<ContactList />);

    // Wait for the component to load the profiles
    await waitFor(() => {
      expect(firestore.collection).toHaveBeenCalledWith('likedProfiles');
    });

    // Verify the profiles are initially loaded
    expect(getByText('alice')).toBeTruthy();
    expect(getByText('bob')).toBeTruthy();

    // Simulate pressing the delete button for 'bob'
    const deleteButton = getAllByText('Unmatch')[1]; // Assuming the delete button for 'bob' is the second one
    fireEvent.press(deleteButton);

    // Wait for the delete action to be processed
    await waitFor(() => {
      expect(firestore.updateDoc).toHaveBeenCalledTimes(2); // Ensure updateDoc was called twice (once for each profile)
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          profiles: expect.arrayContaining([
            expect.not.objectContaining({ username: 'bob' }),
          ]),
        })
      );
    });

    // Verify 'bob' is no longer in the contact list
    expect(() => getByText('bob')).toThrow(); // 'bob' should no longer be present
    expect(getByText('alice')).toBeTruthy(); // 'alice' should still be present
  });
});