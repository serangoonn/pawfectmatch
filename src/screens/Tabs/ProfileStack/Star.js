import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

const Star = ({ filled, onPress }) => {
    const source = filled
        ? require('../ProfileStack/images/filled_star1.png')  // You need to add star images in your project
        : require('../ProfileStack/images/empty_star.png');

    return (
        <TouchableOpacity onPress={onPress}>
            <Image source={source} style={styles.star} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    star: {
        width: 50,
        height: 50,
        marginHorizontal: 2,
    },
});

export default Star;