import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
  AppState,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CameraButton from '../components/CameraButton';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useIsFocused } from '@react-navigation/native';

const Photos = () => {
  const [media, setMedia] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const isFocused = useIsFocused();
  const appState = useRef(AppState.currentState);

  const checkPermissions = async () => {
    const hasPermission = await hasAndroidPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permissions Required',
        'This app requires access to your media to display photos and videos. Please enable the necessary permissions in your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }
    fetchMedia();
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchMedia();
    }
  }, [isFocused]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        fetchMedia();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  async function hasAndroidPermission() {
    const getCheckPermissionPromise = () => {
      if (Platform.Version >= 33) {
        return Promise.all([
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES),
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO),
        ]).then(
          ([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) =>
            hasReadMediaImagesPermission && hasReadMediaVideoPermission,
        );
      } else {
        return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      }
    };

    const hasPermission = await getCheckPermissionPromise();
    if (hasPermission) {
      return true;
    }
    const getRequestPermissionPromise = () => {
      if (Platform.Version >= 33) {
        return PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]).then(
          (statuses) =>
            statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
              PermissionsAndroid.RESULTS.GRANTED,
        );
      } else {
        return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then((status) => status === PermissionsAndroid.RESULTS.GRANTED);
      }
    };

    return await getRequestPermissionPromise();
  }

  const fetchMedia = async () => {
    try {
      const result = await CameraRoll.getPhotos({
        first: 100, // Adjust this to the number of photos you want to fetch
        assetType: 'All',
      });

      const mediaItems = result.edges.map((edge) => ({
        uri: edge.node.image.uri,
        type: edge.node.type,
        date: new Date(edge.node.timestamp * 1000),
      }));
      
      setMedia(mediaItems);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const handleCaptureMedia = async (type) => {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }
    
    try {
      const result = await launchCamera({
        mediaType: type,
        saveToPhotos: true,
      });

      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const newMedia = [...media, { uri, date: new Date() }];
        setMedia(newMedia);
      }
    } catch (error) {
      console.error('Error capturing media:', error);
    }
  };

  

  const groupMediaByDay = (media) => {
    const grouped = media.reduce((acc, { uri, date }) => {
      const day = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      if (!acc[day]) acc[day] = [];
      acc[day].push({ uri, date });
      return acc;
    }, {});

    return Object.keys(grouped).map(day => ({
      day,
      data: grouped[day]
    }));
  };

  const handlePhotoPress = (uri) => {
    setSelectedItem(uri);
    setModalVisible(true);
  };

  const groupedMedia = groupMediaByDay(media);

  const renderMediaItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePhotoPress(item.uri)}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
    </TouchableOpacity>
  );

  const renderDay = ({ item }) => (
    <View>
      <Text style={styles.dayHeader}>{item.day}</Text>
      <FlatList
        data={item.data}
        renderItem={renderMediaItem}
        keyExtractor={(item, index) => item.uri + index}
        numColumns={4}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {media.length > 0 ? (
          <FlatList
            data={groupedMedia}
            renderItem={renderDay}
            keyExtractor={(item, index) => item.day + index}
          />
        ) : (
          <Text style={styles.noPhotosText}>No photos available</Text>
        )}
        <CameraButton onCaptureMedia={handleCaptureMedia} />
      </SafeAreaView>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Image source={{ uri: selectedItem }} style={styles.modalImage} />
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  photo: {
    width: Dimensions.get('window').width / 4.2,
    height: Dimensions.get('window').width / 4.2,
    margin: 2,
  },
  dayHeader: {
    fontSize: 18,
    padding: 10,
    color: "white",
    left: 10,
  },
  noPhotosText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalImage: {
    width: '90%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    padding: 10,
    backgroundColor: '#fff',
  },
  closeButtonText: {
    fontSize: 18,
  },
});

export default Photos;
