import React from 'react';
import { View, Image, Dimensions } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';

const MapScreen = () => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ImageZoom
        cropWidth={screenWidth}
        cropHeight={screenHeight}
        imageWidth={screenWidth}
        imageHeight={screenHeight}
        enableCenterFocus={false}
      >
        <Image
          style={{ width: screenWidth, height: screenHeight }}
          resizeMode="contain"
          source={require('../../assets/delhi/map.png')}
        />
      </ImageZoom>
    </View>
  );
};

export default MapScreen;
