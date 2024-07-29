import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import CreatePetProfile from '../src/screens/CreatePetProfile';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('expo-image-picker');

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
      reset: jest.fn(),
    }),
  };
});

const mockSetDoc = setDoc;
const mockOnAuthStateChanged = onAuthStateChanged;
const mockGetAuth = getAuth;
const mockImagePicker = ImagePicker;

describe('CreatePetProfile', () => {
    beforeEach(() => {
      mockNavigate.mockClear();
      mockSetDoc.mockClear();
      mockImagePicker.launchImageLibraryAsync.mockClear();
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback({ uid: 'test-uid' });
        return () => {};
      });
    });
  
    it('inputs all fields and submits the form successfully', async () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(
        <NavigationContainer>
          <CreatePetProfile />
        </NavigationContainer>
      );
  
      fireEvent.changeText(getByPlaceholderText('Username'), 'testusername');
      fireEvent.changeText(getByPlaceholderText('Pet\'s Name'), 'testpetname');
      fireEvent.changeText(getByPlaceholderText('Breed'), 'testbreed');
      fireEvent.changeText(getByPlaceholderText('Include the age of your pet here.'), 'testdescription');
  
      fireEvent.press(getByText('Select an Animal Type'));
      fireEvent.press(getByText('Dog'));
  
      fireEvent.press(getByText('Select a location'));
      fireEvent.press(getByText('North Region'));
  
      fireEvent.press(getByText('Characteristics of the pet'));
      fireEvent.press(getByText('small'));
      fireEvent.press(getByText('playful'));
  
      fireEvent.press(getByText('Select an organization'));
      fireEvent.press(getByText('SPCA'));
  
      mockImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
        cancelled: false,
        assets: [{ uri: 'test-image-uri' }]
      });
      fireEvent.press(getByText('Pick an image'));
  
      await waitFor(() => expect(getByTestId('image')).toBeTruthy());
  
      fireEvent.press(getByText('Save Profile'));
  
      await waitFor(() => expect(mockSetDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          username: 'testusername',
          petname: 'testpetname',
          location: 'North Region',
          animal: 'Dog',
          breed: 'testbreed',
          description: 'testdescription',
          fixedCharacteristics: ['small', 'playful'],
          organization: 'SPCA',
          imageUrl: 'test-image-uri',
        })
      ));
  
      expect(mockNavigate).toHaveBeenCalledWith('PawfectMatch');
    });
  });