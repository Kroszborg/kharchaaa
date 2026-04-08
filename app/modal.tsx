// Legacy scaffold screen — replaced by add-transaction.tsx
import { Redirect } from 'expo-router';
export default function ModalScreen() {
  return <Redirect href="/add-transaction" />;
}
