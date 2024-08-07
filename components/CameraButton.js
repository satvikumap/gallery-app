import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CameraButton = ({ onCaptureMedia }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onCaptureMedia('photo')} style={styles.button}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>
   

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  button: {
    backgroundColor: '#302f2f',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CameraButton;
