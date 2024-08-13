import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../src/screens/Login';
import { auth } from '../src/utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

jest.mock('firebase/auth');
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: jest.fn(),
  };
});

describe('Login', () => {
  it('logs in with valid email and password', async () => {
    const mockNavigate = jest.fn();
    const mockNavigation = { navigate: mockNavigate, push: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);

    signInWithEmailAndPassword.mockResolvedValue({
      user: {
        email: 'testuser@example.com',
      },
    });

    const { getByPlaceholderText, getByText } = render(<Login />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'testuser@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login')); // Assuming 'Login' is the text on the login button

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('PawfectMatch');
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'testuser@example.com', 'password123');
  });
});