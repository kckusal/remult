import type * as Ably from 'ably';
import type { SubscriptionServer } from '../src/live-query/LiveQueryPublisher';
import type { SubscriptionClient, SubscriptionClientConnection } from '../src/live-query/LiveQuerySubscriber';
export declare class AblyLiveQueryProvider implements SubscriptionClient {
    private ably;
    constructor(ably: Ably.Types.RealtimePromise);
    openConnection(onReconnect: VoidFunction): Promise<SubscriptionClientConnection>;
}
export declare class AblyServerEventDispatcher implements SubscriptionServer {
    private ably;
    constructor(ably: Ably.Types.RealtimePromise);
    publishMessage<T>(channel: string, message: T): void;
}