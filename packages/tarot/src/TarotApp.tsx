import App from './App';
import './TarotApp.css';
import './test-styles.css';
import './styles/tarot-components.css';
import styles from './TarotApp.module.css';

// Wrapper component cho Module Federation với CSS isolation
function TarotApp() {
  return (
    <div className={`tarot-app-wrapper ${styles.wrapper}`}>
      {/* CSS Isolation boundary */}
      <div className={`tarot-app-content ${styles.content}`}>
        <App />
      </div>
    </div>
  );
}

export default TarotApp;