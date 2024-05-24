import {NavigationContainer} from '@react-navigation/native';
import App from './App';

export default function Wrapper(): React.JSX.Element {
  return (
    <NavigationContainer>
      <App />
    </NavigationContainer>
  );
}
