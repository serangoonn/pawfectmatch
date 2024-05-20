import React from 'react'
import { TextInput } from "react-native";

export default function MyTextInput({ value, onChange, placeholder }) {
    return (
    <TextInput
      style={{
        borderWidth: 1,
        borderColor: "black",
        width: "80%",
        borderRadius: "40%",
        padding: 10,
        margin: 6,
      }}
      value={value}
      placeholder={placeholder}
      onChangeText={(e) => {
     onChange(e);
      }}
      />
    );
}