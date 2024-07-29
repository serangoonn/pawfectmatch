import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Feed from '../src/screens/Tabs/SocialStack/Feed'; 
import { firestore } from '../../../utils/firebase';
import { deleteDoc, doc } from 'firebase/firestore';

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
  deleteDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('@react-navigation/core', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

describe('Feed Component', () => {
  it('should delete a post', async () => {
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

    deleteDoc.mockResolvedValueOnce();
    getDocs.mockResolvedValueOnce({
      docs: posts.map(post => ({
        id: post.id,
        data: () => post,
      })),
    });

    const { getByText } = render(<Feed />);

    // Wait for the posts to be loaded
    await waitFor(() => {
      expect(getByText('@testuser')).toBeTruthy();
    });

    // Simulate delete post action
    const deleteButton = getByText('Delete Post');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalledWith(doc(firestore, 'posts', postId));
    });

    // Verify that the post has been deleted
    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });
});
