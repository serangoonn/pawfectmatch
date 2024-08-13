import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Feed from '../src/screens/Tabs/SocialStack/Feed'; 
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
  it('should comment on a post', async () => {
    const postId = '123';
    const commentText = 'This is a test comment';
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
      comments: [],
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

    const { getByPlaceholderText, getByText, getByTestId } = render(<Feed />);

    // Wait for the posts to be loaded
    await waitFor(() => {
      expect(getByText('@testuser')).toBeTruthy();
    });

    // Simulate adding a comment
    const commentInput = getByPlaceholderText('Add a comment...');
    fireEvent.changeText(commentInput, commentText);

    const postButton = getByTestId(`post-comment-button-${postId}`);
    fireEvent.press(postButton);

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(doc(firestore, 'posts', postId), {
        comments: [
          {
            username: 'testuser',
            text: commentText,
            createdAt: expect.any(Date),
          },
        ],
      });
    });

    // Verify that the comment has been added
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });
});