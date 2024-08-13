import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Feed from '../src/screens/Tabs/SocialStack/Feed'; // Update the import path
import { firestore } from '../../../utils/firebase';
import { getAuth } from 'firebase/auth';
import { getDocs, updateDoc, getDoc, doc } from 'firebase/firestore';

// Mock Firebase functions
jest.mock('../../../utils/firebase', () => ({
  firestore: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockReturnValue({
    currentUser: {
      uid: 'user123',
      displayName: 'testuser',
    },
  }),
}));

jest.mock('@react-navigation/core', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

describe('Feed Component', () => {
  it('should like a post', async () => {
    const postId = '123';
    const posts = [
      {
        id: postId,
        username: 'testuser',
        imageUrl: 'http://example.com/image.jpg',
        caption: 'Test caption',
        likes: [],
        comments: [],
      },
    ];

    const postDocData = {
      likes: [],
    };

    getDocs.mockResolvedValueOnce({
      docs: posts.map(post => ({
        id: post.id,
        data: () => post,
      })),
    });

    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => postDocData,
    });

    updateDoc.mockResolvedValueOnce();

    const { getByText, getByTestId } = render(<Feed />);

    // Wait for the posts to be loaded
    await waitFor(() => {
      expect(getByText('@testuser')).toBeTruthy();
    });

    // Simulate like post action
    const likeButton = getByTestId(`like-button-${postId}`);
    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(doc(firestore, 'posts', postId), {
        likes: ['user123'],
      });
    });

    // Verify that the post has been liked
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });
});