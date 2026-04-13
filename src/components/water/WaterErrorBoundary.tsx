import { Component, type ReactNode } from 'react';
import { DARK } from '../../constants/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class WaterErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('WebGL Water shader failed, using fallback:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            background: `linear-gradient(180deg, ${DARK} 0%, #0a1628 40%, #0c2340 70%, #0a1e38 100%)`,
          }}
        />
      );
    }
    return this.props.children;
  }
}
