export type EventType = 
  | 'order.created'
  | 'order.updated'
  | 'inventory.low'
  | 'inventory.updated'
  | 'customer.added'
  | 'customer.churning'
  | 'payment.received'
  | 'payment.failed'
  | 'integration.connected'
  | 'integration.disconnected'
  | 'founder.approved'
  | 'founder.status_changed'
  | 'ai.recommendation_generated'
  | 'workspace.business_name_changed'
  | 'realtime.status_changed';

export interface BusinessEvent {
  id: string;
  type: EventType;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  payload?: any;
}

type EventHandler = (event: BusinessEvent) => void;

class EventBus {
  private handlers: Map<EventType | '*', Set<EventHandler>> = new Map();

  on(type: EventType | '*', handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  emit(type: EventType, title: string, message: string, severity: 'info' | 'success' | 'warning' | 'error' = 'info', payload?: any): BusinessEvent {
    const event: BusinessEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      title,
      message,
      severity,
      timestamp: new Date().toISOString(),
      payload
    };

    // Notify specific handlers
    this.handlers.get(type)?.forEach(fn => {
      try { fn(event); } catch (e) { console.error(`Error in event listener for ${type}:`, e); }
    });

    // Notify wildcard handlers
    this.handlers.get('*')?.forEach(fn => {
      try { fn(event); } catch (e) { console.error(`Error in wildcard event listener:`, e); }
    });

    return event;
  }
}

export const eventBus = new EventBus();
