import { createSubscriber } from 'svelte/reactivity';
import type { ApolloClient, DocumentNode, ObservableQuery, UpdateQueryMapFn, OperationVariables, TypedDocumentNode } from '@apollo/client/core';
import type { DeepPartial } from '@apollo/client/utilities';
import { observeOn, asapScheduler } from 'rxjs'

import { ApolloClientContext } from '../../provider/context.js';

type Options<TData, TVariables extends OperationVariables> = Partial<
	Omit<ApolloClient.WatchQueryOptions<TData, TVariables>, 'query'> & { client: ApolloClient }
>;

export class Query<TData = any, TVariables extends OperationVariables = OperationVariables> {
	// Attibutes
	client: ApolloClient;
	observable: ObservableQuery<TData, TVariables>;
	previousData?: TData | DeepPartial<TData> | undefined = undefined;

	// Methods
	refetch: (variables?: Partial<TVariables> | undefined) => ObservableQuery.ResultPromise<ApolloClient.QueryResult<TData>>;
	fetchMore: <TFetchData = TData, TFetchVars extends OperationVariables = TVariables>(options: ObservableQuery.FetchMoreOptions<TData, TVariables, TFetchData, TFetchVars>) => Promise<ApolloClient.QueryResult<TFetchData>>;
	updateQuery: (mapFn: UpdateQueryMapFn<TData, TVariables>) => void;
	startPolling: (pollInterval: number) => void;
	stopPolling: () => void;
	subscribeToMore: <TSubscriptionData = TData, TSubscriptionVariables extends OperationVariables = TVariables>(options: ObservableQuery.SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData, TVariables>) => () => void;


	// Internals
	private _subscribe: () => void;
	private _result: ObservableQuery.Result<TData, "empty" | "complete" | "streaming" | "partial"> | undefined;

	constructor(
		private query: DocumentNode | TypedDocumentNode<TData, TVariables>,
		private options?: Options<TData, TVariables>
	) {
		this.client = options?.client || ApolloClientContext.get();

		this.observable = this.client.watchQuery<TData, TVariables>({
			query: this.query,
			...this.options
		} as any);

		this._subscribe = createSubscriber((update) => {

			const subscription = this.observable
				.pipe(observeOn(asapScheduler))
				.subscribe((result) => {
					update();
					this.previousData = this._result?.data;
					this._result = result;
				});

			// stop listening when all the effects are destroyed
			return () => {
				console.log('unsubscribe')
				subscription.unsubscribe();
			}
		});

		this.refetch = this.observable.refetch.bind(this.observable);
		this.fetchMore = this.observable.fetchMore.bind(this.observable);
		this.updateQuery = this.observable.updateQuery.bind(this.observable);
		this.startPolling = this.observable.startPolling.bind(this.observable);
		this.stopPolling = this.observable.stopPolling.bind(this.observable);
		this.subscribeToMore = this.observable.subscribeToMore.bind(this.observable);
	}

	get variables() {
		this._subscribe();
		return this.observable.variables;
	}

	get data() {
		this._subscribe();
		return this._result?.data;
	}

	get loading() {
		this._subscribe();
		return this._result?.loading;
	}

	get error() {
		this._subscribe();
		return this._result?.error;
	}

	get dataState() {
		this._subscribe();
		return this._result?.dataState;
	}

	get networkStatus() {
		this._subscribe();
		return this._result?.networkStatus;
	}
}
