import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ContactList from '../src/screens/Tabs/ChatStack/ContactList'; 
import { firestore } from '../../../utils/firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

// Mock Firebase functions
jest.mock('../../../utils/firebase', () => ({
  firestore: {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
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

  it('should filter the contact list based on the search query', async () => {
    const mockProfiles = [
      { username: 'alice', imageUrl: 'http://example.com/alice.jpg', key: '1' },
      { username: 'bob', imageUrl: 'http://example.com/bob.jpg', key: '2' },
      { username: 'carol', imageUrl: 'http://example.com/carol.jpg', key: '3' },
    ];

    // Mock Firestore function to return the mocked profiles
    firestore.collection.mockReturnValue({
      doc: jest.fn().mockReturnThis(),
      getDoc: jest.fn().mockResolvedValue({
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue({ profiles: mockProfiles }),
      }),
    });

    const { getByPlaceholderText, getByText, queryByText } = render(<ContactList />);

    // Wait for the component to load the profiles
    await waitFor(() => {
      expect(firestore.collection).toHaveBeenCalledWith('likedProfiles');
    });

    // Simulate searching for 'bob'
    const searchInput = getByPlaceholderText('Search for contact');
    fireEvent.changeText(searchInput, 'bob');

    // Verify that only 'bob' is displayed in the filtered results
    await waitFor(() => {
      expect(getByText('bob')).toBeTruthy();
      expect(queryByText('alice')).toBeNull();
      expect(queryByText('carol')).toBeNull();
    });
  });
});