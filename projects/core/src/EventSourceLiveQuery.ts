import { Remult } from './context';
import { LiveQuery } from './LiveQuery';
import { fetchEventSource } from '@microsoft/fetch-event-source';


export class EventSourceLiveQuery extends LiveQuery {
    constructor() {
        super(new EventSourceLiveQueryProvider());
    }
}

class EventSourceLiveQueryProvider {
    constructor(private url: string = undefined, private jwtToken?: string) {
        if (!this.url) {
            this.url = Remult.apiBaseUrl + '/stream';
        }
    }
    lastId = 0;
    openStreamAndReturnCloseFunction(clientId: string, onMessage: (message: { data: string, event: string }) => void): VoidFunction {


        const ctrl = new AbortController();

        const headers = {
            "client-id": clientId
        };
        if (this.jwtToken) {
            headers["Authorization"] = "Bearer " + this.jwtToken;
        }
        fetchEventSource(this.url, {
            headers,
            onmessage: message => {
                const mid = +message.id;
                if (mid <= this.lastId && this.lastId - mid < 10)
                    return;
                this.lastId = mid;
                console.log(message.data);
                if (message.event !== 'keep-alive') {
                    onMessage(message);

                }
            },
            onopen: async () => {

            },
            signal: ctrl.signal,
        });
        return () => ctrl.abort();


    }
}