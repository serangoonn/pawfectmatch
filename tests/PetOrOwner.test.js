import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import PetOrOwner from "../src/screens/PetOrOwner"; 

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => {
  return {
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

describe("PetOrOwner", () => {
  beforeEach(() => {
    // Clear any previous calls to mockNavigate before each test
    mockNavigate.mockClear();
  });

  it("navigates to CreatePetProfile when the Pet button is pressed", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <PetOrOwner />
      </NavigationContainer>
    );
    const petButton = getByTestId("pet-button");
    fireEvent.press(petButton);

    // Check that the navigation navigate function was called with the correct argument
    expect(mockNavigate).toHaveBeenCalledWith("CreatePetProfile");
  });

  it("navigates to CreateUserProfile when the Aspiring Pet Owner button is pressed", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <PetOrOwner />
      </NavigationContainer>
    );
    const aspiringPetOwnerButton = getByTestId("aspiring-pet-owner-button");
    fireEvent.press(aspiringPetOwnerButton);

    // Check that the navigation navigate function was called with the correct argument
    expect(mockNavigate).toHaveBeenCalledWith("CreateUserProfile");
  });
});