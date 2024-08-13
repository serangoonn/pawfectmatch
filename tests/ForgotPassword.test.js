import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPassword from '../src/screens/ForgotPassword';
import { auth } from '../src/utils/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

jest.mock('firebase/auth');
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: jest.fn(),
  };
});

describe('ForgotPassword', () => {
  it('sends a password reset email with valid email', async () => {
    const mockNavigate = jest.fn();
    const mockNavigation = { navigate: mockNavigate, goBack: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);

    sendPasswordResetEmail.mockResolvedValue();

    const { getByPlaceholderText, getByTestId } = render(<ForgotPassword />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'testuser@example.com');
    fireEvent.press(getByTestId('forgotPasswordButton'));

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'testuser@example.com');
      expect(mockNavigate).not.toHaveBeenCalled(); // Check that no navigation occurs on success
    });

    // Optionally, you can check for the alert
    // expect(Alert.alert).toHaveBeenCalledWith("Password reset email sent");
  });

  it('shows an error with an invalid email', async () => {
    const mockNavigate = jest.fn();
    const mockNavigation = { navigate: mockNavigate, goBack: jest.fn() };
    useNavigation.mockReturnValue(mockNavigation);

    sendPasswordResetEmail.mockRejectedValue(new Error('Invalid email address'));

    const { getByPlaceholderText, getByTestId } = render(<ForgotPassword />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email');
    fireEvent.press(getByTestId('forgotPasswordButton'));

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'invalid-email');
      expect(mockNavigate).not.toHaveBeenCalled(); // Check that no navigation occurs on failure
    });

    // Optionally, you can check for the alert
    // expect(Alert.alert).toHaveBeenCalledWith("Error", "Invalid email address");
  });
});