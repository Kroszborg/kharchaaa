// This screen is hidden from the tab bar (href: null in _layout.tsx)
// Kept as a file to avoid Expo Router warnings about missing routes
import { Redirect } from 'expo-router';
export default function ExploreScreen() {
  return <Redirect href="/" />;
}
