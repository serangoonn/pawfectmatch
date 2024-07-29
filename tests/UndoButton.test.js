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
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

describe('Swipe Component', () => {
  it('should go back to the previous profile using the undo button', async () => {
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
      {
        id: 'pet2',
        username: 'petuser2',
        imageUrl: 'http://example.com/image2.jpg',
        location: 'Location2',
        breed: 'Breed2',
        animal: 'Animal2',
        description: 'Description2',
        fixedCharacteristics: ['Characteristic2'],
        organization: 'Organization2',
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

    // Verify that the first profile is skipped
    await waitFor(() => {
      expect(getByText('@petuser2')).toBeTruthy();
    });

    // Simulate pressing the undo button
    const undoButton = getByTestId('undoButton');
    fireEvent.press(undoButton);

    // Verify that the first profile is restored
    await waitFor(() => {
      expect(getByText('@petuser1')).toBeTruthy();
    });
  });
});