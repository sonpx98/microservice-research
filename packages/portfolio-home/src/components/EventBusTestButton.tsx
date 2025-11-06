import { eventBus } from '@microservice-research/event-bus';

export function EventBusTestButton() {
  const testNotification = () => {
    console.log('[Test] Emitting test notification...');
    eventBus.emit('notification:show', {
      message: '🧪 Test notification from button',
      type: 'info',
      duration: 3000
    });
  };

  const checkListeners = () => {
    const listeners = eventBus.getActiveListeners();
    console.log('[Test] Active listeners:', listeners);
    alert(JSON.stringify(listeners, null, 2));
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex gap-2">
      <button
        onClick={testNotification}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg font-medium"
      >
        🧪 Test Notification
      </button>
      <button
        onClick={checkListeners}
        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg font-medium"
      >
        📋 Check Listeners
      </button>
    </div>
  );
}
