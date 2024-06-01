import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

export default function MyBtn({text, onPress}) {
    return (
        <TouchableOpacity 
        style={{
            backgroundColor: "lightblue",
            padding: 10,
            borderRadius: 20,
            width: "60%",
            margin: 6,
        }}
            onPress={(e) => {
            onPress(e);
        }}
        >
            <Text
                style={{
                    color: "white",
                    textAlign: "center"
                }}
                >
                {text} 
                </Text>
        </TouchableOpacity>
    );
}