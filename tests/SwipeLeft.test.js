import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Swipe from '../src/screens/Tabs/HomeStack/Swipe'; 
import { firestore } from '../../../utils/firebase';
import { getAuth } from 'firebase/auth';
import { getDocs, setDoc, doc } from 'firebase/firestore';

// Mock Firebase functions
jest.mock('../../../utils/firebase', () => ({
  firestore: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
}));

jest.mock('firebase/firestore', () => ({
  getDocs: jest.fn(),
  setDoc: jest.fn(),
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

describe('Swipe Component', () => {
  it('should swipe left on a profile to skip it', async () => {
    const petProfiles = [
      {
        id: 'pet1',
        username: 'petuser1',
        imageUrl: 'http://example.com/image1.jpg',
        location: 'Location1',
        breed: 'Breed1',
        animal: 'Animal1',
        description: 'Description1',
        fixedCharacteristics: ['Characteristic1'],
        organization: 'Organization1',
      },
    ];

    getDocs.mockResolvedValueOnce({
      docs: petProfiles.map(pet => ({
        id: pet.id,
        data: () => pet,
      })),
    });

    const { getByText, getByTestId } = render(<Swipe />);

    // Wait for the pets to be loaded
    await waitFor(() => {
      expect(getByText('@petuser1')).toBeTruthy();
    });

    // Simulate a swipe left action
    const swiper = getByTestId('swiper');
    swiper.props.onSwipedLeft(0);

    // Verify that the swipe left action has been handled correctly
    await waitFor(() => {
      // Add assertions here if you have specific side effects you want to test
    });
  });
});