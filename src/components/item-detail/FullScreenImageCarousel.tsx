import React, { useCallback, useEffect, useRef, useState } from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import {
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  BackHandler,
  Dimensions
} from 'react-native';
import { Colors, Fonts } from '../../global-styles';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ItemImage } from '../../types/API';
import ImageWithFallback from '../ImageWithFallback';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { CarouselItem } from './ImageCarousel';

type FullScreenImageCarouselProps = {
  images: ItemImage[];
  onClose?: () => void;
  activeCarouselIndex: number;
};

const { width: viewportWidth } = Dimensions.get('window');

const FullScreenImageCarousel = ({
  images,
  onClose,
  activeCarouselIndex: carouselIndex
}: FullScreenImageCarouselProps): JSX.Element => {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(carouselIndex);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  // Need to modify the backdrop so that it shows up if we only have one snap point
  // https://github.com/gorhom/react-native-bottom-sheet/issues/585#issuecomment-900619713
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} {...props} />
    ),
    []
  );

  const closeBottomSheet = () => bottomSheetRef.current?.close();

  const renderImage = ({ item }: CarouselItem<ItemImage>) => (
    <ImageWithFallback
      source={{ uri: item.imageURL }}
      style={styles.image}
      resizeMode="contain"
    />
  );

  const renderImageCarousel = () => {
    return (
      <View style={styles.carouselContainer}>
        <Carousel
          data={images}
          renderItem={renderImage}
          sliderWidth={viewportWidth * 0.95}
          itemWidth={viewportWidth * 0.95}
          onSnapToItem={setActiveCarouselIndex}
          firstItem={activeCarouselIndex}
        />
        <View style={{ marginBottom: images.length === 1 ? 32 : 0 }}>
          <Pagination
            dotStyle={{ marginBottom: -6 }}
            dotsLength={images.length}
            activeDotIndex={activeCarouselIndex}
          />
        </View>
      </View>
    );
  };

  const onBackPress = () => {
    closeBottomSheet();
    // Returning true here to prevent going back to the previous screen
    // when the back button is pressed
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, []);

  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['100%']}
        backdropComponent={renderBackdrop}
        onClose={onClose}
        handleComponent={null}
        enablePanDownToClose
      >
        <TouchableWithoutFeedback onPress={closeBottomSheet}>
          <View style={styles.headerContainer}>
            <View
              style={{
                ...styles.header,
                paddingTop: Platform.select({
                  ios: insets.top + 4,
                  android: insets.top + 16
                })
              }}
            >
              <FontAwesome name="chevron-down" size={24} color="black" />
              <Text style={styles.cancelText}>Images</Text>
            </View>
            <Text style={styles.cancelSubHeader}> Swipe down to close</Text>
          </View>
        </TouchableWithoutFeedback>
        {renderImageCarousel()}
      </BottomSheet>
    </Portal>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 24,
    paddingLeft: 24,
    backgroundColor: Colors.appBackgroundColor
  },
  header: {
    flexDirection: 'row'
  },
  cancelText: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    marginLeft: 24,
    marginTop: Platform.select({ ios: 5 })
  },
  cancelSubHeader: {
    fontFamily: Fonts.text,
    color: Colors.textMuted,
    marginTop: 8
  },
  carouselContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.appBackgroundColor
  },
  image: {
    width: '100%',
    height: '100%'
  }
});

export default FullScreenImageCarousel;
