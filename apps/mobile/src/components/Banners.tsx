import { View, StyleSheet } from 'react-native';
import { OfflineBanner } from './OfflineBanner';
import { UpdateBanner } from './UpdateBanner';

export function Banners() {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <UpdateBanner />
      <OfflineBanner floating={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});
