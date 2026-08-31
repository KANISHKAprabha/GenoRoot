import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 32, fontFamily: 'monospace', background: '#fff3f3',
          minHeight: '100vh', color: '#8b0000',
        }}>
          <h2 style={{ marginBottom: 16 }}>⚠ Rendering error</h2>
          <p style={{ marginBottom: 8 }}>{String(this.state.error)}</p>
          <pre style={{ fontSize: 13, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.stack}
          </pre>
          <button
            style={{ marginTop: 24, padding: '10px 20px', cursor: 'pointer' }}
            onClick={() => this.setState({ error: null })}
          >
            Reset
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
