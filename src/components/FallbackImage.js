import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FALLBACK_IMAGE_URL } from '../config/constants';

export default function FallbackImage({
  source,
  style,
  resizeMode = 'cover',
  fallbackUri = FALLBACK_IMAGE_URL,
}) {
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);

  const imageUri = hasError || !source?.uri ? fallbackUri : source.uri;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: imageUri }}
        style={[StyleSheet.absoluteFill, style]}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setHasError(true);
          setLoading(false);
        }}
      />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#10B981" />
        </View>
      )}
      {hasError && (
        <View style={styles.errorBadge}>
          <Ionicons name="image-outline" size={14} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  errorBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 3,
  },
});
